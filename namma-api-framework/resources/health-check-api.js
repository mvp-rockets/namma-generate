const { logInfo } = require('lib');

module.exports = function (req, res) {
    logInfo('Request to get server health-check api', {});

    res.json({
        isHealthy: true
    })
}