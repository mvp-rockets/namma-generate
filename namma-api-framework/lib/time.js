const moment = require('moment');


module.exports.getTodayDate = () => moment().format();

module.exports.getTodayDateOnly = () => moment().format('YYYY-MM-DD');

module.exports.getCurrentTimeStamp = () => moment.utc().valueOf();


module.exports.addDaysToTimeStamp = days => moment.utc().add(days, 'days').valueOf();

module.exports.addDaysToDate = days => moment.utc().add(days, 'days').format();

module.exports.getExpirationTimeStamp = days => moment.utc().add(days, 'days').valueOf();
