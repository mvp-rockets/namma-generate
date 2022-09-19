const nodemailer = require('nodemailer');
const Result = require('folktale/result');
const { logError, logInfo } = require('lib');
const config = require('config/config.js');


module.exports.send = mailOptions => new Promise((resolve, reject) => {
    logInfo('Sending email', {
        to: mailOptions.to,
        from: '',
        subject: mailOptions.subject,
        html: mailOptions.html
    });

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: config.email.no_reply.user,
            pass: config.email.no_reply.password
        }
    });

    transporter.sendMail({
        from: config.email.no_reply.user,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html
    }, (error, result) => {
        if (error) {
            logError('Failed to sent email', error);
            resolve(Result.Error(error));
        } else {
            logInfo('Successfully sent email', result);
            resolve(Result.Ok(result));
        }
    });
});
