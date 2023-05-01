'use strict';

import { handleMessage, handlePostback } from './handleConversation/handleCustomerMessage.js';
import { proceed } from './handleConversation/processCustomerMessage.js';
import { manageTopic } from './topicManager/manageTopic.js';
var fbMessenger = require("./services/fbMessenger.js");



module.exports.fbVerify = (event, context, callback) => {
    if (event.query['hub.mode'] === 'subscribe' &&
        event.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
        console.log("Validating webhook");
        //on répond a facebook 
        callback(null, parseInt(event.query['hub.challenge']));

        //on ajoute un bouton get started.
        fbMessenger.putStartedButton();
        fbMessenger.putNestedMenus();

        return;
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        return callback('Invalid token test');
    }
};


module.exports.fbMessages = (event, context, callback) => {

     var response = {
      'body': "ok",
      'statusCode': 200
    };

    //on répond un 200 OK
    callback(null, response);

    // Parse the request body from the POST
    let body = event.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {


        body.entry.forEach(function(entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

    } else {
        // TODO: Return a '404 Not Found' if event is not from a page subscription
    }
};


module.exports.deliversMessageBoxes = (event, context, callback) => {

     var response = {
      'body': "ok",
      'statusCode': 200
    };

    //on répond un 200 OK
    callback(null, response);

    proceed(event);

}

module.exports.postTopic = (event, context, callback) => {

     var response = {
      'body': "ok",
      'statusCode': 200
    };

    //on répond un 200 OK
    callback(null, response);

    manageTopic(event.body);

}