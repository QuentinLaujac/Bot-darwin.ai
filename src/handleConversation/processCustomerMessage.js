'use strict';

var dynamoDB = require("./../services/dynamoDB.js");
var fbMessenger = require("./../services/fbMessenger.js");


/**
 *
 * Gere toutes le flow de conversation
 * Il ne gere pour l'instant que la reception de message texte
 *
 ***/
async function proceed(sqsEvents) {
    console.log("================ PROCCED MESSAGE ================", sqsEvents);

    //si il n'y a pas de messageBox alors on ne fait rien
    if (!sqsEvents && !sqsEvents.Records) {
        return;
    }

    //Pour tous les messages que j'ai a taiter
    sqsEvents.Records.forEach((message, index) => {

        var boxMessage = removeTypeBoxMessage(message.messageAttributes);

        console.log("================ boxMessage VAUT ================", boxMessage);

        //Si la date a envoyer est plus ancienne que ma date
        sendByType(boxMessage);
    });
}

function sendByType(boxMessage) {
    return new Promise(async function(resolve, reject) {

        boxMessage.message = (boxMessage.message == "") ? "" : JSON.parse(boxMessage.message);
        boxMessage.attachment = (boxMessage.attachment == "") ? "" : JSON.parse(boxMessage.attachment);

        switch (boxMessage.type) {
            case "typing":
                await fbMessenger.typingOn(boxMessage.senderId);
                break;
            case "txt":
                await fbMessenger.sendTxtMsg(boxMessage.senderId, boxMessage.message);
                break;
            case "gif":
                await fbMessenger.sendGif(boxMessage.senderId, boxMessage.message);
                break;
            case "template":
                boxMessage.attachment = JSON.parse(boxMessage.attachment);
                console.log("switch sendTemplate vaut", boxMessage);
                await fbMessenger.sendTemplate(boxMessage.senderId, boxMessage.attachment.elements, boxMessage.attachment.templateType);
                break;
            case "urlButton":
                boxMessage.attachment = JSON.parse(boxMessage.attachment);
                console.log("switch urlButton vaut", boxMessage);
                await fbMessenger.sendUrlButton(boxMessage.senderId, boxMessage.message, boxMessage.attachment.url, boxMessage.attachment.titleButton);
                break;
            case "shareButton":
                boxMessage.attachment = JSON.parse(boxMessage.attachment);
                console.log("switch shareButton vaut", boxMessage);
                await fbMessenger.sendShareButton(boxMessage.senderId, boxMessage.attachment.title, boxMessage.attachment.subtitle, boxMessage.attachment.imageUrl, boxMessage.attachment.buttonUrl, boxMessage.attachment.buttonTitle);
                break;
            case "quickReplies":
                await fbMessenger.sendQuickReplies(boxMessage.senderId, boxMessage.message, boxMessage.attachment);
                break;
            case "seen":
                await fbMessenger.markSeens(boxMessage.senderId);
                break;
            default:
                console.log("TYPE DE BOX MESSAGE NON COMPRIS");
        }
    })

}

function removeTypeBoxMessage(boxMessage) {
    var bm = {};
    bm.type = boxMessage.type ? boxMessage.type.stringValue : "";
    bm.senderId = boxMessage.senderId ? boxMessage.senderId.stringValue : "";
    bm.message = boxMessage.message ? boxMessage.message.stringValue : "";
    bm.attachment = boxMessage.attachment ? boxMessage.attachment.stringValue : "";
    return bm;
}


export { proceed };