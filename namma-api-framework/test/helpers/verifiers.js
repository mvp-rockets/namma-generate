/* eslint-disable no-throw-literal */
/* eslint-disable no-console */
const sinon = require('sinon');
const R = require('ramda');
const Result = require('folktale/result');
const chai = require('chai');

const { assert } = chai;


module.exports.verifyResultOk = fn => (result) => {
    result.matchWith({
        Ok: ({
            value
        }) => {
            fn(value);
        },
        Error: ({
            value
        }) => {
            const error = R.contains(value.constructor.name, ['Object', 'Structure'])
                ? JSON.stringify(value) : value.toString();
            throw error + new Error().stack;
        }
    });
};

module.exports.verifyResultError = fn => (result) => {
    result.matchWith({
        Ok: ({
            value
        }) => {
            const error = R.contains(value.constructor.name, ['Object', 'Structure'])
                ? JSON.stringify(value) : value.toString();
            throw error + new Error().stack;
        },
        Error: ({
            value
        }) => {
            fn(value);
        }
    });
};


module.exports.verifyError = (fn, done) => (result) => {
    this.verifyResult(() => {
        done('Expected result to be an error!');
    }, (value) => {
        fn(value);
    })(result);
};

module.exports.verifyArgs = fn => sinon.match((value) => {
    fn(value);
    return true;
});
