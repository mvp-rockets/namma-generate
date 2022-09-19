const Route = require('route');
const { logInfo, respond } = require('lib');
const AWS = require('../s3-bucket');

const post = async (req) => {
    const { fileKey } = req.body;

    logInfo('Request to fetch presigned url', { fileKey });

    const response = await AWS.getUploadPreSignedUrl(fileKey);

    return respond(response, 'Successfully fetched presigned url!', 'Failed to fetch presigned url!');
};

Route.withSecurity().noAuth().post('/aws/get-upload-pre-signed-url', post).bind();

module.exports.post = post;
