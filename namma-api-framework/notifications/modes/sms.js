const Result = require('folktale/result');
const config = require('config/config.js');
const { logError, logInfo } = require('lib');
const ConsumerSms = require('notifications/models/consumer-sms');
const ProxyService = require('proxy/services/proxy-service.js');

const axios = require('axios');
const sendSms = ((consumerSms) => {
    logInfo('sending sms from twilio', { consumerSms });
    return new Promise((resolve) => {
        axios({
            method: 'get',
            url: `https://api-alerts.kaleyra.com/v4/`,
            params: {
                api_key: config.twilio.apiKey,
                format: 'json',
                method: 'sms',
                message: consumerSms.message,
                entity_id: config.twilio.entity,
                to: consumerSms.to,
                sender: config.twilio.sender,
                template_id: consumerSms.template_id
            }
        })
            .then((message) => {
                logInfo('Successfully sent sms', message.data);
                resolve(Result.Ok(message.data));
            })
            .catch((ex) => {
                logError('Failed to send sms', ex);
                resolve(Result.Error(ex));
            });
    });
});
module.exports.send = async (details) => {
    const consumerSms = new ConsumerSms(details.mobile, details.message, details.template_id);
    logInfo('Request to send sms', { consumerSms });
    console.log("sms", consumerSms);
    if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test') {
        return ProxyService.send({ response: { status: true, message: 'sent data to twilio sms' } });
    }
    const result = await sendSms(consumerSms);
    return result;
};