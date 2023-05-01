'use strict';

var AWS = require('aws-sdk');
AWS.config.update({ region: process.env.REGION });
var sqs = new AWS.SQS({ apiVersion: process.env.API_VERSION });

exports.insertBoxMessageInQ = function(senderId, type, delay, message, attachment) {
    console.log("URL SQS : ",process.env.MESSAGE_QUEUE_URL)
    return new Promise((resolve, reject) => {
        var messageAttributes = {};
        messageAttributes.senderId = {
            DataType: "String",
            StringValue: senderId
        };
        messageAttributes.type = {
            DataType: "String",
            StringValue: type
        };
        if (message) {
            messageAttributes.message = {
                DataType: "String",
                StringValue: JSON.stringify(message)
            };
        }
        if (attachment) {
            messageAttributes.attachment = {
                DataType: "String",
                StringValue: JSON.stringify(attachment)
            };
        }
        var params = {
        	DelaySeconds: delay,
            MessageAttributes: messageAttributes,
            MessageBody: "Message by " + senderId + " of type " + type,
            QueueUrl: process.env.MESSAGE_QUEUE_URL
        };

        console.log("insertBoxMessageInQ vaut ", params);
        sqs.sendMessage(params, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(data.MessageId);
            }
        });
    })
}


exports.getBoxMessageInQ = function(senderId, type, delay, message, attachment) {
    return new Promise((resolve, reject) => {
        var params = {
            AttributeNames: [
                "senderId", "type", "message", "attachment"
            ],
            MaxNumberOfMessages: 1,
            MessageAttributeNames: [
                "All"
            ],
            QueueUrl: process.env.MESSAGE_QUEUE_URL,
            VisibilityTimeout: 0,
            WaitTimeSeconds: 0
        };

        sqs.receiveMessage(params, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else if (data.Messages) {
                var deleteParams = {
                    QueueUrl: process.env.MESSAGE_QUEUE_URL,
                    ReceiptHandle: data.Messages[0].ReceiptHandle
                };
                sqs.deleteMessage(deleteParams, function(err, data) {
                    if (err) {
                        console.log("Delete Error", err);
                        reject(err);
                    } else {
                        console.log("Message Deleted", data);
                        resolve(data.Messages);
                    }
                });
            }
        });
    })
}