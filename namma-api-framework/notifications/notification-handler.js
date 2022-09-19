const { logInfo } = require('lib');
const SMS = require('notifications/modes/sms');
const WhatsApp = require('notifications/modes/whatsapp');
const Mailer = require('notifications/modes/mailer');
const Fcm = require('notifications/modes/fcm');
const R = require('ramda');
const { whenResult } = require('lib');
const messagesRepository = require('notifications/messages');
const NotificationMessage = require('notifications/notification-message');
const Result = require('folktale/result');

const isSms = mode => mode === 'sms';
const isWhatsApp = mode => mode === 'whatsapp';
const isEmail = mode => mode === 'email';
const isFcm = mode => mode === 'fcm';

const sendNotification = R.curry(async (userNotificationDetails, modes) => {

    const allResult = R.map(mode => R.cond([
        [
            isSms,
            () => SMS.send({
                mobile: mode.to,
                message: userNotificationDetails.messages.sms,
                priority: 1
            })
        ],
        [
            isWhatsApp,
            () => WhatsApp.send({
                mobile: mode.to,
                messageInfo: { text: userNotificationDetails.messages.whatsapp }
            })
        ],
        [
            isEmail,
            () => Mailer.send({
                to: mode.to,
                html: userNotificationDetails.messages.email.message,
                subject: userNotificationDetails.messages.email.subject
            })
        ],
        [
            R.equals('fcm'),
            () => Fcm.send({
                token: mode.to,
                body: userNotificationDetails.messages.fcm.formattedBody,
                data: userNotificationDetails.details.data,
                title: userNotificationDetails.messages.fcm.title
            })
        ],
        [R.T, Result.Ok('No action needed')]
    ])(mode.name))(modes);

    const response = Promise.all(allResult);
    return Result.Ok(modes);
});

const getFCMMessage = R.curry((data, details) => {
    details.formattedBody = new NotificationMessage(details.body).format(data);
    return details;
});

const getEmailMessage = R.curry((data, details) => {
    details.subject = new NotificationMessage(details.subject).format(data);
    details.message = new NotificationMessage(details.message).format(data);
    return details;
});

const getGenericMessage = R.curry((data, details) => new NotificationMessage(details).format(data));

module.exports.send = async (details) => {
    logInfo('Request to send sms and whatsapp notifications', details);

    const NotificationConfig = messagesRepository.get(details.preferredLanguage);
    const notificationDetails = Object.assign({}, NotificationConfig[details.context]);
    const messages = R.mapObjIndexed((num, key, obj) => R.cond([
        [isFcm, () => getFCMMessage(details.data, notificationDetails.messages[key])],
        [isEmail, () => getEmailMessage(details.data, notificationDetails.messages[key])],
        [isSms, () => getGenericMessage(details.data, notificationDetails.messages[key])],
        [isWhatsApp, () => getGenericMessage(details.data, notificationDetails.messages[key])],
        [R.T, R.identity]
    ])(key))(notificationDetails.messages);

    const result = Result.Ok({
        details,
        messages
    });

    const response = await whenResult(userNotification => sendNotification(userNotification, details.modes))(result);

    return response;
};
