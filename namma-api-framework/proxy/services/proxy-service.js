const { logInfo } = require('lib');
const axios = require('axios');
const config = require('config/config.js');
const Result = require('folktale/result');

module.exports.send = async (data) => {
    logInfo('Sending data to proxy service', { data });
    const url = config.proxyApiUrl;
    const reqData = data || {};
    const forwardResponse = await axios.post(url, reqData);
    return Result.Ok(forwardResponse.data);
};
