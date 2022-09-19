const config = require('config');

const secretVariable = {
    apiPort: process.env.API_PORT,
    env: process.env.ENVIRONMENT,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    dialect: process.env.DB_DIALECT,
    seederStorage: process.env.DB_SEEDER_STORAGE,
    awsCloudwatch: {
        enableAwsLogger: process.env.AWS_LOG_ENABLE === 'true',
        logGroupName: process.env.AWS_LOG_GROUP_NAME,
        logStreamName: process.env.AWS_LOG_STREAM_NAME,
        accessKeyId: process.env.AWS_LOG_ACCESS_KEY_ID,
        secretKey: process.env.AWS_LOG_SECRET_KEY,
        region: process.env.AWS_LOG_REGION
    },
    awsS3: {
        access_key_id: process.env.AWS_S3_ACCESS_KEY_ID,
        secret_access_key: process.env.AWS_S3_SECRET_ACCESS_KEY,
        region: process.env.AWS_S3_REGION,
        bucketName: process.env.AWS_S3_BUCKET_NAME
    },
    awsSQS: {
        accessKeyId: process.env.AWS_SQS_ACCESS_KEY_ID,
        accessKey: process.env.AWS_SQS_ACCESS_KEY,
        region: process.env.AWS_SQS_REGION,
        url: process.env.AWS_SQS_URL,
        arn: process.env.AWS_SQS_ARN,
        deadLetterQueue: process.env.AWS_SQS_DEAD_LETTER_QUEUE

    },
    clsNameSpace: process.env.CLS_NAMESPACE,
    cors: {
        whiteListOrigins: process.env.WHITE_LIST_ORIGINS
            ? process.env.WHITE_LIST_ORIGINS.split(',')
            : [],

    },
    jwtSecretKey: process.env.JWT_SECRET_KEY
};

const variables = { ...secretVariable, ...config };
module.exports = variables;
