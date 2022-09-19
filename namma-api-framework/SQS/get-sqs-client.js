const AWS = require('aws-sdk');
const config = require('config/config');

AWS.config.update({
    apiVersion: '2012-11-05',
    region: config.awsSQS.region,
    accessKeyId: config.awsSQS.accessKeyId,
    secretAccessKey: config.awsSQS.secretAccessKey
});

const SQS = new AWS.SQS();
module.exports = () => SQS;
