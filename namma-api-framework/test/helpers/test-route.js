const Route = require('../../route.js');

module.exports.execute = async function exe(url, method, req, res) {
    return new Promise((resolve, reject) => {
        try {
            Route.execute(url, method, req, res, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};


module.exports.executeWithError = async function exe(url, method, req, res) {
    return new Promise((resolve, reject) => {
        try {
            Route.execute(url, method, req, res, (error, result) => {
                if (error) {
                    resolve(error);
                } else {
                    reject(`expected error but got ${result}`);
                }
            });
        } catch (e) {
            resolve(error);
        }
    });
};
