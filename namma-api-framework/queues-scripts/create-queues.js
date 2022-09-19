const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '..'));
const CreateQueues = require('SQS/create-queues.js');

const perform = async () => {
    try {
        CreateQueues.perform();
        return;
    } catch (ex) {
        console.log('Create queues failed', ex);
        return ex;
    }
};

perform();
