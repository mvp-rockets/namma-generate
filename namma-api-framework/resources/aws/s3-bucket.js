const config = require('config/config');
const AWS = require('aws-sdk');
const Result = require('folktale/result');

const awsS3  = config.awsS3;
const path = require('path');
const mime = require('mime');

AWS.config.update({
    accessKeyId: awsS3.access_key_id,
    secretAccessKey: awsS3.secret_access_key,
    region: awsS3.region
});

const s3Bucket = new AWS.S3({
    params: {
        Bucket: awsS3.bucketName
    }
});

const getSignedUrl = (fileKey) => new Promise((resolve, reject) => {
    const params = {
        Bucket: awsS3.bucketName,
        Key: fileKey
    };

    s3Bucket.getSignedUrl('getObject', params, (err, data) => {
        if (err) {
            return reject(new Error(Result.Error('some error occurred')));
        }
        return resolve(Result.Ok(data));
    });
});

const getUploadPreSignedUrl = (fileKey) => new Promise((resolve, reject) => {
    const extension = path.extname(fileKey);
    const extensionContentType = mime.getType(extension);
    const contentType = extensionContentType.split('/');
    const actualContentType = `${contentType[0]}/`;

    const bucketParams = {
        Bucket: awsS3.bucketName,
        Expires: 3600,
        Fields: {
            key: fileKey
        },
        Conditions: [
            { acl: 'public-read' },
            ['starts-with', '$Content-Type', actualContentType]
        ]
    };

    s3Bucket.createPresignedPost(bucketParams, (err, data) => {
        if (err) {
            return reject(new Error(Result.Error('some error occurred')));
        }

        return resolve(Result.Ok(data));
    });
});

module.exports = {
    s3Bucket, Bucket: awsS3.bucketName, getSignedUrl, getUploadPreSignedUrl
};
