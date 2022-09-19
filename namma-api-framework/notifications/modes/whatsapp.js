// const config = require('config-handler');
// const { logInfo } = require('lib/functional/logger');
// const ProxyService = require('resources/proxy-api/services/proxy-service');
// const WhatsappKarixProvider = require('notifications/modes/whatspp-karix-provider');
// const WhatsappGupshupProvider = require('notifications/modes/whatspp-gupshup-provider');

// module.exports.send = async (details) => {
//     const { useProxy } = config.whatsapp;
//     const { mobile, messageInfo } = details;

//     logInfo('whatsapp send :', {
//         mobile, messageInfo, useProxy
//     });

//     if (useProxy) {
//         return ProxyService.send({ response: { status: true, message: 'sent data to business whats app' } });
//     }

//     if (config.chatProvider === 'gupshup') {
//         return WhatsappGupshupProvider.send({
//             mobile, messageInfo
//         });
//     }

//     return WhatsappKarixProvider.send({
//         mobile, messageInfo
//     });
// };
