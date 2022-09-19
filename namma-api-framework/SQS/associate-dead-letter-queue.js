const SQS = require('SQS/get-sqs-client')();
const config = require('config/config');

module.exports.perform = async () => {
    const { queues } = config;
    const { arn } = config.SQS;
    const { deadLetterQueue } = config.awsSQS;
    const { url } = config.SQS;
    const deadLetterQueueArn = `${arn}:${deadLetterQueue}`;
    for (const [key, value] of Object.entries(queues)) {
        const params = {
            Attributes: {
                RedrivePolicy: `{\"deadLetterTargetArn\":\"${deadLetterQueueArn}\",\"maxReceiveCount\":\"5\"}`
            },
            QueueUrl: `${url}/${value}`
        };
        SQS.setQueueAttributes(params, (err, data) => {
            if (err) {
                console.log('Error', err);
            } else {
                console.log('Success', data.ResponseMetadata);
            }
        });
    }
};
