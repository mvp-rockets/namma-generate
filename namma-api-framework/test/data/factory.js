const { factory } = require('factory-girl');

const loadFactory = async () => {
    factory.define('user', Object, {
        id: factory.chance('guid'),
        name: factory.chance('name')
    });
};

module.exports.factory = factory;
module.exports.loadFactory = loadFactory;
