const deleteEntityById = require('test/data/delete-entity-by-id');
const definations = require('test/data/factory').factory;
const createUserQuery = require('resources/users/queries/create-user-query');

const entity = async (name, replace) => new Promise(async (resolve, reject) => {
    let data = await definations.build(name);
    if (replace) {
        data = replace(data);
    }
    resolve(data);
});

const buildEntity = (name) => entity(name);

const user = {
    name: 'user',
    create: (user) => [new createUserQuery({ id: user.id, name: user.name })],
    build: () => entity('user'),
    delete: (user) => [new deleteEntityById(user.id, 'User')]
};

module.exports = {
    buildEntity,
    user
};
