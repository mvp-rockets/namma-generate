const fs = require('fs');
const path = require('path');
require('pg').defaults.parseInt8 = true;
const Sequelize = require('sequelize');

const basename = path.basename(__filename);

const cls = require('cls-hooked');
const config = require('config/config');
const namespace = cls.createNamespace(config.clsNameSpace);
Sequelize.useCLS(namespace);

const db = {};
const dbConfig = {
    host: config.host,
    username: config.username,
    password: config.password,
    database: config.database,
    dialect: config.dialect,
    seederStorage: config.seederStorage
};
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

fs
    .readdirSync(__dirname)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

sequelize.options.logging = false;
db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;
