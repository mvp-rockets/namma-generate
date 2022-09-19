const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '..'));
const CreateDeadLetterQueues = require('SQS/create-dead-letter-queues');

const perform = async () => {
    try {
        CreateDeadLetterQueues.perform();
        return;
    } catch (ex) {
        console.log('Create queues failed', ex);
    }
};

perform();
