const Maybe = require('folktale/maybe');

const getDataFromResult = (defaultValue, data) => data.getOrElse(Maybe.Nothing()).getOrElse(defaultValue);

module.exports = {
    getDataFromResult
};
