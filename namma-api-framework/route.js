const async = require('async');

const { ApiError, logError, whenResult } = require('lib');
const { HTTP_CONSTANT, token } = require('@mvp-rockets/namma-lib');

class Route {
    constructor() {
        this.handlers = {};
        this.app = {
            get() { },
            post() { },
            put() { },
            delete() { }
        };
    }

    setApp(app) {
        this.app = app;
    }

    withSecurity() {
        return new PreRequestHandler(new RestHandler(this, this.app), security);
    }

    withOutSecurity() {
        return new PreRequestHandler(new RestHandler(this, this.app), (req, res, next) => {
            next(null, {
                status: true
            });
        });
    }

    getHandler(url, method) {
        if (!this.handlers[url]) {
            return {
                status: false,
                message: `${url} not registered `
            };
        }
        if (!this.handlers[url][method]) {
            return {
                status: false,
                message: `${url} not registered for ${method}`
            };
        }
        return {
            status: true,
            handler: this.handlers[url][method]
        };
    }

    addToCache(url, restHandler) {
        const existingHandler = this.handlers[url];
        let exists = false;
        if (existingHandler) {
            const handlerForGivenMethod = existingHandler[restHandler.method];
            if (handlerForGivenMethod) {
                handlerForGivenMethod.push(restHandler);
                exists = true;
            } else {
                existingHandler[restHandler.method] = [restHandler];
                exists = false;
            }
        } else {
            this.handlers[url] = {};
            this.handlers[url][restHandler.method] = [restHandler];
            exists = false;
        }
        return {
            alreadyExist: exists
        };
    }

    bind(restHandler) {
        var self = this;
        var result = this.addToCache(restHandler.url, restHandler);
        if (!result.alreadyExist) {
            var self = this;
            var result = self.getHandler(restHandler.url, restHandler.method);
            const handlersForUrl = result.handler;
            var restHandler = handlersForUrl[0];
            this.bindToRouter(
                restHandler.url,
                restHandler.method,
                restHandler.preRequestHandler.securityCheck,
                (req, res, next) => {
                    self.execute(restHandler.url, restHandler.method, req, res, (error, result) => {
                        if (error) next(error, result);
                        else {
                            res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
                            res.set('Pragma', 'no-cache');
                            res.set('Expires', 0);
                            res.send(result);
                        }
                    });
                }
            );
        }
    }

    bindToRouter(url, method, auth, next) {
        if (method === 'Get') {
            this.app.get(url, auth, next);
        } else if (method === 'Post') {
            this.app.post(url, auth, next);
        } else if (method === 'Put') {
            this.app.put(url, auth, next);
        } else if (method === 'Delete') {
            this.app.delete(url, auth, next);
        }
    }

    execute(url, method, req, res, next) {
        const self = this;
        const result = self.getHandler(url, method);
        if (!result.status) {
            next(result.message);
        } else {
            const handlersForUrl = result.handler;
            async.detect(handlersForUrl, (handler, callback) => {
                handler.preRequestHandler.filterFunction(req, res, callback);
            }, async (err, selectedHandler) => {
                if (err) { next(err); return; }
                const { functionToBeCalled } = selectedHandler;
                try {
                    const { sequelize } = require('./models');

                    await sequelize
                        .transaction(async (t1) => {
                            const result1 = await functionToBeCalled(req, res);
                            result1.matchWith({
                                Ok: ({
                                    value
                                }) => {
                                    next(null, value);
                                },
                                Error: ({
                                    value
                                }) => {
                                    throw value;
                                }
                            });

                            async.applyEach(
                                selectedHandler.postRequestHandler.nextSteps,
                                result1,
                                (error, result) => {
                                    if (error) {
                                        logError('Failed in route', error);
                                    }
                                }
                            );

                            async.applyEach(
                                selectedHandler.postRequestHandler.nextSteps,
                                result1,
                                (error, result) => {
                                    if (error) {
                                        logError('Failed in route', error);
                                    }
                                }
                            );
                        });
                } catch (error) {
                    next(error);
                }
            });
        }
    }
}

class RestHandler {
    constructor(peopplRoute, app) {
        this.peopplRoute = peopplRoute;
        this.app = app;
    }

    setPreRequestHandler(preRequestHandler) {
        this.preRequestHandler = preRequestHandler;
    }

    get(url, functionToBeCalled) {
        this.url = url;
        this.functionToBeCalled = functionToBeCalled;
        this.method = 'Get';
        this.postRequestHandler = new PostRequestHandler(this);
        return this.postRequestHandler;
    }

    post(url, functionToBeCalled) {
        this.url = url;
        this.functionToBeCalled = functionToBeCalled;
        this.method = 'Post';
        this.postRequestHandler = new PostRequestHandler(this);
        return this.postRequestHandler;
    }

    delete(url, functionToBeCalled) {
        this.url = url;
        this.functionToBeCalled = functionToBeCalled;
        this.method = 'Delete';
        this.postRequestHandler = new PostRequestHandler(this);
        return this.postRequestHandler;
    }

    put(url, functionToBeCalled) {
        this.url = url;
        this.functionToBeCalled = functionToBeCalled;
        this.method = 'Put';
        this.postRequestHandler = new PostRequestHandler(this);
        return this.postRequestHandler;
    }

    bind() {
        this.peopplRoute.bind(this);
    }
}

class PreRequestHandler {
    constructor(restHandler, securityCheck) {
        this.securityCheck = securityCheck;
        this.restHandler = restHandler;
    }

    authorize(filterFunction) {
        this.filterFunction = filterFunction;
        this.restHandler.setPreRequestHandler(this);
        return this.restHandler;
    }

    noAuth() {
        this.filterFunction = (req, res, next) => next(null, true);
        this.restHandler.setPreRequestHandler(this);
        return this.restHandler;
    }
}

class PostRequestHandler {
    constructor(restHandler) {
        this.restHandler = restHandler;
        this.nextSteps = [];
    }

    then(nextStep) {
        this.nextSteps.push(nextStep);
        return this;
    }

    bind() {
        this.restHandler.bind();
    }
}

async function security(req, res, next) {
    const clientToken = req.body.token || req.query.token || req.headers['x-access-token'];
    if (clientToken) {
        const decodedTokenResult = await token.decode(clientToken);
        whenResult(
            (decoded) => {
                req.decoded = decoded;
                next();
            },
            (error) => {
                logError('token verification failed', error);
                next(new ApiError('unauthorized', 'Failed to authenticate token.', HTTP_CONSTANT.UNAUTHORIZED));
            }
        )(decodedTokenResult);
    } else {
        logError('No Token provided', +req.originalUrl);
        next(new ApiError('Forbidden', 'No token provided.', HTTP_CONSTANT.FORBIDDEN));
    }
}
module.exports = new Route();
