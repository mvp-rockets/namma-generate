const R = require('ramda');

function isPrimitive(test) {
    return (test !== Object(test));
}

const relaceEveryOccuranceWith = R.curry((name, object, data) => {
    if (isPrimitive(data)) return data;
    const foundProperty = R.has(name, data);
    if (foundProperty) {
        data[name] = object;
    }
    for (property in data) {
        relaceEveryOccuranceWith(name, object, data[property]);
    }
    return data;
});

const replaceEveryOccuranceWithObject = R.curry((object, data) => {
    for (property in object) {
        relaceEveryOccuranceWith(property, object[property], data);
    }
    return data;
});

module.exports = { replaceEveryOccuranceWithObject, relaceEveryOccuranceWith };
