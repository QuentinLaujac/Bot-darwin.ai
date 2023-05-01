'use strict';

var fbGraphApi = require("./../services/fbGraphApi.js");
var dynamoDB = require("./../services/dynamoDB.js");
var botForStatistics = require("./botForStatistics.js");


/**
 *
 * Gere toutes le flow de conversation
 * Il ne gere pour l'instant que la reception de message texte
 *
 ***/
async function handleMessage(sender_psid, message) {

    //Si c'est du texte
    if (message && message.text) {

        console.log("===========================MESSAGE RECU =====================>");
        console.log(message);

        //On notifie l'utilisateur qu'on a vu le message
        await botForStatistics.markMessageSeens(sender_psid);

        //On recupere le user associe a l'id pour recuperer sa ref de message.
        var user = await dynamoDB.getUser(sender_psid);
        console.log("=========================== USER VAUT =====================>");
        console.log(user);

        //Si l'utilisateur n'existe pas (si c'est la première conversation avec l'utilisateur)
        if (!user || !user.refConv) {
            user = {};
            user.refConv = "1";
            user.needToWrite = true; //on ne fait pas de nlp sur le premier message
            user.senderId = sender_psid;

            //on interroge facebook pour avoir ses informations
            var userfb = await fbGraphApi.getCustomerInformations(user.senderId);
            if (userfb) {
                user.lastname = userfb.lastname;
                user.firstname = userfb.firstname;
                user.profilePic = userfb.profilePic;
            }

        }

        //on declare une variable nous permettant de temporiser les messages
        user.timeBtwnMsg = 0;

        await dynamoDB.insertUserLog(user, message.text);

        //si le message est une réponse à des quick replies
        if (message.quick_reply) {
            user.refConv = message.quick_reply.payload;
            console.log("payload vaut : ", user.refConv);
            await updateStatsQuestion(message.text, user.refConv);
        } else { //Si c'est du texte écrit

            //Les mots clefs pour redémarrer la conversation
            if (message.text === "Get Started" || message.text === "Démarrer" || message.text === "démarrer" || message.text === "demarrer") {
                user.refConv = "1";
            } else {
                if (!user.needToWrite) {
                    await botForStatistics.sendMissunderstood(user);
                }
            }
        }
        
        //On lui envoie un message en fonction de sa ref de message
        var userToUpdate = await botForStatistics.talkTo(user);

        //On met à jour sa référence de message si elle est différente
        await dynamoDB.updateUser(userToUpdate);
    }
}


async function handlePostback(sender_psid, message) {
    console.log("=========================== ENTER POST-BACK =====================>", message);
    if (message && message.payload == "WelcomeEvent"); {
        message.text = "Get Started";
        handleMessage(sender_psid, message)
    }
}

function updateStatsQuestion(message, refConv) {
    return new Promise(async function(resolve, reject) {
        var questionStat = await dynamoDB.getStatQuestion(message + "" + refConv);
        var nbClick = (questionStat) ? ++questionStat.nbClick : 1;
        await dynamoDB.updateStatQuestion(message, refConv, nbClick);
        resolve();
    });
}




export { handleMessage, handlePostback };