const config = require("config-handler");
const { logInfo, logError } = require('lib');

const { standardizeMobile } = require("lib/standardize-mobile");
const request = require("request");
const Maybe = require("folktale/maybe");
const Result = require("folktale/result");
const R = require("ramda");

const getVideoMessage = (messageInfo, sendTo, sendFrom) => {
  let messageBody = {
    channel: "WABA",
    content: {
      preview_url: true,
      text: messageInfo.text,
      type: "TEXT",
    },
    recipient: {
      to: sendTo,
      recipient_type: "individual",
      reference: {
        cust_ref: "Some Customer Ref",
        messageTag1: "Message Tag Val1",
        conversationId: "Some Optional Conversation ID",
      },
    },
    sender: {
      from: sendFrom,
    },
  };
  return messageBody;
};

const getImageMessage = (messageInfo, sendTo, sendFrom) => {
  let messageBody = {
    channel: "WABA",
    content: {
      preview_url: false,
      shorten_url: false,
      type: "ATTACHMENT",
      attachment: {
        mimeType: "image/jpeg",
        type: "image",
        url: messageInfo.url,
      },
    },
    recipient: {
      to: sendTo,
      recipient_type: "individual",
      reference: {
        cust_ref: "Some Customer Ref",
        messageTag1: "Message Tag Val1",
        conversationId: "Some Optional Conversation ID",
      },
    },
    sender: {
      from: sendFrom,
    },
  };
  return messageBody;
};

const getTextMessage = (messageInfo, sendTo, sendFrom) => {
  let messageBody = {
    channel: "WABA",
    content: {
      preview_url: false,
      text: messageInfo.text,
      type: "TEXT",
    },
    recipient: {
      to: sendTo,
      recipient_type: "individual",
      reference: {
        cust_ref: "Some Customer Ref",
        messageTag1: "Message Tag Val1",
        conversationId: "Some Optional Conversation ID",
      },
    },
    sender: {
      from: sendFrom,
    },
  };
  return messageBody;
};

const isVideo = (type) => type === "video";

const isImage = (type) => type === "image";

module.exports.send = (details) => {
  logInfo("whatsapp karix provider", details);
  const { mobile, messageInfo } = details;

  const sendTo = standardizeMobile(mobile);
  const sendFrom = config.whatsapp.karix.mobile;
  const messageBody = R.cond([
    [isVideo, () => getVideoMessage(messageInfo, sendTo, sendFrom)],
    [isImage, () => getImageMessage(messageInfo, sendTo, sendFrom)],
    [R.T, () => getTextMessage(messageInfo, sendTo, sendFrom)],
  ])(messageInfo.type);

  logInfo("Sending message via karix details", { to: sendTo, from: sendFrom, messageBody });
  const options = {
    rejectUnauthorized: false,
    url: config.whatsapp.karix.url,
    body: {
      message: messageBody,
      metaData: {
        version: "v1.0.9",
      },
    },
    json: true,
    headers: {
      Accept: "application/json",
      Authentication: `Bearer ${config.whatsapp.karix.apiKey}`,
    },
  };

  return new Promise((resolve) => {
    request.post(options, (error, result) => {
      if (!error) {
        logInfo("Successfully sent whatsapp message from karix", {
          to: sendTo,
          result,
        });
        resolve(Result.Ok(Maybe.Just(result)));
      } else {
        logError("Failed to send whatsapp message from karix", { error });
        resolve(Result.Error(error));
      }
    });
  });
};
