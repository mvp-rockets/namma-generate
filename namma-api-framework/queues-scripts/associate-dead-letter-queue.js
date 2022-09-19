const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '..'));
const AssociateDeadLetterQueues = require('SQS/associate-dead-letter-queue.js');


const perform = async () => {
    try {
        AssociateDeadLetterQueues.perform();
        return;
    } catch (ex) {
        console.log('associate dead letter queue failed', ex);
        return ex;
    }
};

perform();
