const Result = require('folktale/result');
const { ApiError } = require('lib')
const { HTTP_CONSTANT } = require('@mvp-rockets/namma-lib');

const resolveOk = value => Promise.resolve(Result.Ok(value));

const resolveError = value => Promise.resolve(Result.Error(value));

const resolveValidationError = value => Promise.resolve(Result.Error(new ApiError(value, 'Validation Failed', HTTP_CONSTANT.BAD_REQUEST)));

const resolveDbResult = value => resolveOk(value);

module.exports.resolveOk = resolveOk;
module.exports.resolveError = resolveError;
module.exports.resolveDbResult = resolveDbResult;
module.exports.resolveValidationError = resolveValidationError;
