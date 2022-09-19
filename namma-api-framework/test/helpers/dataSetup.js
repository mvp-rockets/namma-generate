/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const R = require('ramda');
const db = require('db/repository');
const common = require('helpers/common');
const { whenResult, doNothing } = require('lib')
const { notEmpty } = require('validation')

const data = require('./data');
const dataValueUpdater = require('./update-data-value');

let cache = [];

const factory = async function () {
    if (arguments.length === 0) {
        throw new Error('factory requires at least one argument');
    }
    const init = Array.prototype.slice.call(arguments);
    const all = R.map(async need => await need(), init);
    const allEntities = await Promise.all(all);
    cache = cache.concat(allEntities);
    return R.compose(
        R.head,
        R.mapAccum((acc, data) => [Object.assign(acc, R.head(data)), data], {})
    )(allEntities);
};

const build = function (entity, useValue, name) {
    name = name || entity.name;
    if (typeof (useValue) === 'function') {
        useValue = useValue || withNoValueChange;
    } else {
        useValue = useValue != undefined ? withValue(useValue) : withNoValueChange;
    }
    return async function () {
        const data = await R.composeP(withName(name), useValue, (data) => {
            if (entity.update) { return entity.update(data); } return data;
        }, entity.build)();
        return [data, entity];
    };
};

const buildSingle = function (entity, value) {
    return R.composeP(getEntity, R.head, addToCache, build(entity, value))();
};


const createAssociatedEntities = R.curry(
    async (name, data, dependencies, changeDependency) => {
        for (const index in dependencies) {
            const dependency = dependencies[index];
            let dataTransformer = dependency[0];
            let entity = dependency[1];
            if (changeDependency && changeDependency[entity.name]) {
                dataTransformer = changeDependency[entity.name][0];
                entity = changeDependency[entity.name][1];
            }
            const createdDependency = await create(
                entity,
                dataTransformer(R.head(data)[name]),
                entity.name,
                changeDependency
            )();


            const parentEntity = R.head(data)[name];
            parentEntity[entity.name] = createdDependency[0][entity.name];
        }
    }
);

const create = (entity, value, name, changeDependency) => {
    if (!entity) throw Error('entity not defined');
    name = name || entity.name;
    return async () => {
        const data = await build(entity, value, name)();
        if (R.head(data)[name].created_by_factory) {
            return data;
        }

        if (notEmpty(entity.dependency)) {
            await createAssociatedEntities(
                entity.name,
                data,
                entity.dependency,
                changeDependency
            );
        }

        const promises = R.map(db.execute, entity.create(R.head(data)[name]));
        const result = await Promise.all(promises);

        whenResult(createdEntity => R.head(data)[name].created_by_factory = true)(result[0]);
        whenResult(doNothing, e => console.trace(entity.name, e))(result[0]);
        whenResult(doNothing, (e) => {
            throw e;
        })(result[0]);

        if (entity.transform) {
            R.head(data)[name] = entity.transform(
                common.getDataFromResult(null, result),
                R.head(data)[name]
            );
        }

        return data;
    };
};


const addToCache = (data) => {
    cache.push(data);
    return data;
};

var getEntity = function (data) {
    const propertyName = R.compose(R.head, R.keys)(data);
    return data[propertyName];
};


const createSingle = (entity, value, changeDependency) => R.composeP(
    getEntity,
    R.head,
    addToCache,
    create(entity, value, entity.name, changeDependency)
)();

const deleteAssociatedEntities = async (entity, data, changeDependency) => {
    let deletedEntity;
    if (data) {
        if (entity.has) {
            const deleteResult = R.map((dependent) => {
                let transformer = dependent[0];
                let dependentEntity = dependent[1];
                if (changeDependency && changeDependency[entity.name]) {
                    [transformer, dependentEntity] = changeDependency[entity.name];
                }
                const transformedData = transformer(data);
                return deleteAssociatedEntities(
                    dependentEntity,
                    transformedData,
                    changeDependency
                );
            }, entity.has);
            const result = await Promise.all(deleteResult);
        }
        try {
            entity.delete(data).forEach(async (entityToDelete) => {
                await db.execute(entityToDelete);
            });
        } catch (e) {
            console.log(entity.name);
            console.log(e);
        }
        if (entity.dependency) {
            const deleteResult = R.map((dependent) => {
                let transformer = dependent[0];
                let dependentEntity = dependent[1];
                if (changeDependency && changeDependency[entity.name]) {
                    transformer = changeDependency[entity.name][0];
                    dependentEntity = changeDependency[entity.name][1];
                }
                const transformedData = transformer(data);
                return deleteAssociatedEntities(
                    dependentEntity,
                    transformedData,
                    changeDependency
                );
            }, entity.dependency);
            await Promise.all(deleteResult);
        }
    }
    return data;
};

const deleteEntity = R.curry(async (changeDependency, entityToDelete) => {
    const data = R.compose(getEntity, R.head)(entityToDelete);
    const entity = R.last(entityToDelete);
    return deleteAssociatedEntities(entity, data, changeDependency);
});


const deleteAll = async function (changeDependency) {
    const dataToDelete = cache;
    cache = [];
    return Promise.all(R.map(deleteEntity(changeDependency), dataToDelete));
};

var withName = R.curry((name, entity) => {
    const data = {};
    data[name] = entity;
    return data;
});


const keyify = (obj, prefix = '') => Object.keys(obj).reduce((res, el) => {
    if (Array.isArray(obj[el])) {
        return res;
    } if (typeof obj[el] === 'object' && obj[el] !== null) {
        return [...res, ...keyify(obj[el], `${prefix + el}.`)];
    }
    return [...res, prefix + el];
}, []);


var withValue = R.curry((value, entity) => R.mergeDeepRight(entity, value));

var withNoValueChange = data => data;

const retriveNestedEntity = (name, object) => {
    const foundProperty = R.has(name, object);
    if (foundProperty) {
        return {
            found: true,
            value: object[name]
        };
    }
    if (R.keys(object).length === 0) {
        return {
            found: false
        };
    }
    for (const [key, value] of Object.entries(object)) {
        const response = retriveNestedEntity(name, value);
        if (response.found) return response;
    }
    return {
        found: false
    };
};

module.exports = R.mergeAll([
    data,
    {
        factory,
        build,
        buildSingle,
        create,
        createSingle,
        deleteEntity,
        deleteAll,
        withValue,
        retriveNestedEntity
    },
    dataValueUpdater
]);
