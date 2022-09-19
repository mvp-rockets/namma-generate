const SQS = require('SQS/get-sqs-client.js')();
const config = require('config/config.js');
const Result = require('folktale/result');
const { logInfo, logError } = require('lib');

module.exports.perform = async (data, queueName) => new Promise((resolve) => {
    const messageBody = {
        data,
        queueName
    };
    logInfo('Request to push data to queue', { messageBody });
    const params = {
        MessageBody: JSON.stringify(messageBody),
        QueueUrl: `${config.SQS.url}/${queueName}`
    };
    SQS.sendMessage(params, (err, data) => {
        if (err) {
            console.log('error', err);
            logError('Puhsed to queue failed', { message: err.message });
            resolve(Result.Error(err));
        } else {
            logInfo('Puhsed to queue Success', {});
            resolve(Result.Ok(data));
        }
    });
});
