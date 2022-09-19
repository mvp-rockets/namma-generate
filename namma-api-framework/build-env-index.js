const AWS = require('aws-sdk');
const fs = require('fs').promises;

AWS.config.update({
    accessKeyId: process.env.AWS_SM_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SM_SECRET_ACCESS_KEY_ID
});

const perform = async () => {
    try {
        const client = new AWS.SecretsManager(
            {
                apiVersion: process.env.AWS_SM_API_VERSION,
                region: process.env.AWS_SM_REGION

            }
        );
        const SecretId = process.env.AWS_SM_SECRET_ID;
        client.getSecretValue({ SecretId }, async (err, data) => {
            if (err) {
                console.log('error from aws secret', err);
                process.exit(1);
            } else {
                console.log('Got secrets from AWS ');
                const secretsJSON = JSON.parse(data.SecretString);

                let secretsString = '';
                Object.keys(secretsJSON).forEach((key) => {
                    secretsString += `${key}=${secretsJSON[key]}\n`;
                });
                await fs.writeFile(`env/.env.${process.env.NODE_ENV}`, secretsString);
                await fs.writeFile('.env', secretsString);
                process.exit(0);
            }
        });
    } catch (error) {
        console.log('error while make connection to aws secret', error);
        process.exit(1);
    }
};

perform();
