'use strict';

var dynamoDB = require("./../services/dynamoDB.js");

/**
 *
 * Gere toutes le flow de conversation
 * Il ne gere pour l'instant que la reception de message texte
 *
 ***/
async function manageTopic(topic) {

    var listLineTopic = createListLineTopic(topic);
    await saveListTopic(listLineTopic);


}

function saveListTopic(listLineTopic) {
    return new Promise(async function(resolve, reject) {
        if(!Array.isArray(listLineTopic)){
            reject();
        }
        for(var i = 0; i != listLineTopic.length; i++){
            var topic = listLineTopic[i];
            await dynamoDB.insertLineTopic(topic);
        }
        resolve();
    });
}


function createListLineTopic(topic) {

    if (!topic && !topic.content && !Array.isArray(topic.content)) {
        return;
    }

    var i = 0;
    var currentBlocRef = "";
    var listLineTopic = [];
    var blocConversation = [];
    do {
        var conversation = topic.content[i];

        // On ajoute la conversationTitle devant l'id pour pouvoir le retrouver parmi plusieurs conversations
        if(conversation.nextBlockRefId){
            conversation.nextBlockRefId = conversation.nextBlockRefId + "" + topic.conversationTitle;
        }

        // Pareil mais cette fois c'est dans les attachment
        if(conversation.type == "quickReplies" && conversation.attachment && conversation.attachment !== ""){
            conversation.attachment = Array.isArray(conversation.attachment)?conversation.attachment:JSON.parse(conversation.attachment);
            for(var j = 0; j != conversation.attachment.length; j++){
                var attachment = conversation.attachment[j];
                attachment.refConv = attachment.refConv + "" + topic.conversationTitle;
            }
        }

        if (conversation.blockRefMessageID !== currentBlocRef && currentBlocRef !== "" ) {
            listLineTopic.push(createLineTopic(topic.conversationTitle, topic.type, topic.category, topic.author, topic.description, currentBlocRef, blocConversation));
            var blocConversation = [];
        }

        currentBlocRef = conversation.blockRefMessageID;
        blocConversation.push(conversation);

    } while (++i != topic.content.length);

    //On insert le dernier topic
    listLineTopic.push(createLineTopic(topic.conversationTitle, topic.type, topic.category, topic.author, topic.description, currentBlocRef, blocConversation));

    return listLineTopic;
}


function createLineTopic(conversationTitle, type, category, author, description, blockRefMessageID, blocConversation) {
    var lineTopic = {};
    lineTopic.id = blockRefMessageID +""+ conversationTitle ;
    lineTopic.blockRefMessageID = blockRefMessageID +"";
    lineTopic.conversationTitle = conversationTitle;
    lineTopic.type = type;
    lineTopic.category = category;
    lineTopic.author = author;
    lineTopic.description = description;
    lineTopic.blocConversation = blocConversation;

    return lineTopic;
}


export { manageTopic };