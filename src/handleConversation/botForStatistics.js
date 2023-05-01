'use strict';

var sqs = require("./../services/sqs.js");
var dynamoDB = require("./../services/dynamoDB.js");

exports.talkTo = function(user) {
    return new Promise(async function(resolve, reject) {

        if (user.refConv === "1") {
            var listDistinctTopic = await getListDistinctTopicForQuickReplies();
            await sqs.insertBoxMessageInQ(user.senderId, "quickReplies", 0, "Voici la liste des différents topic", listDistinctTopic);
            return resolve(user);
        }

        //TEST
        var iblocker = 0;

        //Pour retourner sur une autre conversation on fait une boucle while que l'on quitte lors des returns 
        while (++iblocker < 15) {

            console.log("on est entre");
            console.log(user.refConv);
            var lineTopic = await dynamoDB.getLineTopic(user.refConv);
            console.log(lineTopic);
            if (!Array.isArray(lineTopic.blocConversation)) {
                return reject();
            }
            console.log("avant for");
            for (var i = 0; i != lineTopic.blocConversation.length; i++) {
                var conversation = lineTopic.blocConversation[i];
                await sqs.insertBoxMessageInQ(user.senderId, conversation.type, user.timeBtwnMsg, conversation.message, conversation.attachment);
                console.log("timebtwnMsg vaut :", user.timeBtwnMsg);
               
                if (Number.isInteger(conversation.secondBtwnNextMsg)) {
                    user.timeBtwnMsg += conversation.secondBtwnNextMsg;
                }

                if (conversation.badge) {
                    if (!user.listBadge || !Array.isArray(user.listBadge)) {
                        user.listBadge = [];
                    }
                    user.listBadge.push(conversation.badge);
                }

                if (conversation.nextBlockRefId) {
                    user.refConv = conversation.nextBlockRefId;
                }
                console.log("je teste");

                if (conversation.userAction) {
                    console.log("conversation userAction vaut :", conversation.userAction);
                    user.needToWrite = conversation.freeAnswer && conversation.freeAnswer != "";
                    console.log("conversation freeAnswer vaut :", conversation.freeAnswer);
                    return resolve(user);
                }
            }
        }
        await sqs.insertBoxMessageInQ(user.senderId, "txt", 0, "ERREUR DANS LA CONVERSATION ==> BOUCLE INFINI DÉTECTÉ", "");
        user.refConv = 1;
    });
}

exports.sendMissunderstood = function(user) {
    return new Promise(async function(resolve, reject) {
        console.log("-------------- PASSAGE MISSUNDERSTOOD-----------------");
        user.timeBtwnMsg += 0;
        await sqs.insertBoxMessageInQ(user.senderId, "txt", user.timeBtwnMsg, "Désolé je ne peux pas encore te comprendre 😖");
        user.timeBtwnMsg += 1;
        await sqs.insertBoxMessageInQ(user.senderId, "typing", user.timeBtwnMsg);
        user.timeBtwnMsg += 2;
        await sqs.insertBoxMessageInQ(user.senderId, "txt", user.timeBtwnMsg, "Cependant tu peux interagir avec moi via les boutons qui s'afficheront");
        user.timeBtwnMsg += 3;
        await sqs.insertBoxMessageInQ(user.senderId, "txt", user.timeBtwnMsg, "Je reprends où j'en étais 😇");
        console.log("-------------- END MISSUNDERSTOOD-----------------");
        resolve();
    });
}

exports.markMessageSeens = function(sender_psid) {
    return new Promise(async function(resolve, reject) {
        await sqs.insertBoxMessageInQ(sender_psid, "seen", 0);
        resolve();
    });
}

function getListDistinctTopicForQuickReplies() {
    return new Promise(async function(resolve, reject) {
        var allTopic = await dynamoDB.getAllLineTopic();

        if (!Array.isArray(allTopic)) {
            return reject();
        }

        allTopic.sort(function(a, b) {
            if (a.conversationTitle < b.conversationTitle)
                return -1;
            if (a.conversationTitle > b.conversationTitle)
                return 1;
            return 0;
        });

        var currentTitle = "";
        var listDistinctTopic = [];
        for (var i = 0; i != allTopic.length; i++) {
            var topic = allTopic[i];
            if (topic.conversationTitle === currentTitle) {
                continue;
            }

            //Tous nos topic commencent sur ka refConv 1000
            listDistinctTopic.push({ msg: topic.conversationTitle, refConv: "1000" + topic.conversationTitle });
            currentTitle = topic.conversationTitle;
        }

        resolve(listDistinctTopic);
    });
}