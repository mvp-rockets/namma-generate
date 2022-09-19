const config = require('config-handler');
const { logInfo, logError } = require('lib');
const Result = require('folktale/result');
const axios = require('axios');
const qs = require('querystring');
const R = require('ramda');


const getTextMessage = (messageInfo, sendTo) => qs.stringify({
    method: 'SendMessage',
    format: 'json',
    userid: config.whatsapp.gupshup.twoWay.userId,
    password: config.whatsapp.gupshup.twoWay.password,
    send_to: sendTo,
    v: config.whatsapp.gupshup.v,
    auth_scheme: config.whatsapp.gupshup.auth_scheme,
    msg_type: 'HSM',
    msg: messageInfo.text
});

const getImageMessage = (messageInfo, sendTo) => qs.stringify({
    method: 'SendMediaMessage',
    format: 'json',
    userid: config.whatsapp.gupshup.hsm.userId,
    password: config.whatsapp.gupshup.hsm.password,
    send_to: sendTo,
    v: config.whatsapp.gupshup.v,
    auth_scheme: config.whatsapp.gupshup.auth_scheme,
    msg_type: 'IMAGE',
    media_url: messageInfo.url,
    caption: messageInfo.caption
});

const isImage = type => type === 'image';

module.exports.send = (details) => {
    logInfo('whatspp gupshup provider', details);
    const { mobile, messageInfo } = details;

    const sendTo = mobile;

    const formData = R.cond([
        [isImage, () => getImageMessage(messageInfo, sendTo)],
        [R.T, () => getTextMessage(messageInfo, sendTo)]
    ])(messageInfo.type);

    const options = {
        method: 'post',
        url: config.whatsapp.gupshup.apiEndPoint,
        headers: {
            'Content-Type': 'application/json',
            TENANT: config.m2p.tenant
        },
        data: formData
    };
    logInfo('Sending message via gupshup details', { to: sendTo, formData });
    return new Promise((resolve) => {
        axios(options).then((result) => {
            logInfo('Successfully sent whatsapp message from gupshup', {
                to: sendTo,
                result: result.data
            });
            resolve(Result.Ok(result.data));
        }).catch((error) => {
            logError('Failed to send whatsapp message from gupshup', { error });
            resolve(Result.Error(error));
        });
    });
};
