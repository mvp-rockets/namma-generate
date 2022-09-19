const SQS = require('SQS/get-sqs-client.js')();
const config = require('config/config.js');

module.exports.perform = async () => {
    const { queues } = config;
    for (const [key, value] of Object.entries(queues)) {
        const params = {
            QueueName: value
        };
        SQS.createQueue(params, (err, data) => {
            if (err) {
                console.log('Error', err);
            } else {
                console.log('Success', data.QueueUrl);
            }
        });
    }
};
