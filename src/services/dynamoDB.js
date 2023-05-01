'use strict';

var AWS = require('aws-sdk');
AWS.config.update({ region: process.env.REGION });
var ddb = new AWS.DynamoDB({ apiVersion: process.env.API_VERSION });
var attr = require('dynamodb-data-types').AttributeValue;

//--------------------------------------------- USERS ------------------------------------------
exports.getAllUsers = function() {
    return new Promise((resolve, reject) => {
        var params = {
            TableName: process.env.TABLE_USERS
        };
        ddb.scan(params, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(data.Items);
            }
        });
    })
}

exports.getUser = function(senderId) {
    return new Promise((resolve, reject) => {
        var params = {
            TableName: process.env.TABLE_USERS,
            Key: {
                'senderId': senderId,
            }
        };
        params.Key = attr.wrap(params.Key);
        ddb.getItem(params, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else if (data) {
                var user = attr.unwrap(data.Item);
                user.needToWrite = user.needToWrite ? user.needToWrite : false;
                resolve(user);
            }
        });
    })
}

exports.updateUser = function(user) {
    return new Promise((resolve, reject) => {
        console.log("======================== MISE A JOUR USER =====================");
        console.log(user)
        var needToWrite = user.needToWrite != "";
        console.log("need to write vaut : ", needToWrite);
        var params = {
            TableName: process.env.TABLE_USERS,
            Item: {
                'senderId': user.senderId,
                'refConv': user.refConv,
                'firstname': user.firstname,
                'lastname': user.lastname,
                'profilePic': user.profilePic,
                'needToWrite': needToWrite
            }
        };
        params.Item = attr.wrap(params.Item);
        ddb.putItem(params, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(data.Item);
            }
        });
    })
}


//--------------------------------------------- USER LOG ----------------------------------------------

exports.insertUserLog = function(user, message) {
    return new Promise((resolve, reject) => {
        console.log("======================== User log =====================");
        console.log(message);
        var timestamp = Date.now();
        var params = {
            TableName: process.env.TABLE_USER_LOG,
            Item: {
                'id': user.senderId + "" + timestamp,
                'date': timestamp + "",
                'refConv': user.refConv + "",
                'message': message + "",
                'senderId': user.senderId + "",
                'firstname': user.firstname + "",
                'lastname': user.lastname + "",
                'profilePic': user.profilePic + ""
            }
        };
        params.Item = attr.wrap(params.Item);
        ddb.putItem(params, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(data.Item);
            }
        });
    })
}

exports.getStatQuestion = function(message) {
    return new Promise((resolve, reject) => {
        var params = {
            TableName: process.env.TABLE_QUESTION_STATS,
            Key: {
                'id': message,
            }
        };
        params.Key = attr.wrap(params.Key);
        ddb.getItem(params, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else if (data) {
                var questionStat = attr.unwrap(data.Item);
                questionStat.nbClick = questionStat.nbClick ? Number(questionStat.nbClick) : 0;
                resolve(questionStat);
            }
        });
    })
}

exports.updateStatQuestion = function(message, refConv, previewsClick) {
    return new Promise((resolve, reject) => {
        console.log("======================== Update question stat =====================");
        console.log(message);
        var timestamp = Date.now();
        var params = {
            TableName: process.env.TABLE_QUESTION_STATS,
            Item: {
                'id': message + "" + refConv,
                'message': message + "",
                'refConv': refConv + "",
                'nbClick': previewsClick + "",
                'date': timestamp + ""
            }
        };
        params.Item = attr.wrap(params.Item);
        ddb.putItem(params, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(data.Item);
            }
        });
    })
}


//--------------------------------------------- Box message ----------------------------------------------
exports.getAllLineTopic = function() {
    return new Promise((resolve, reject) => {
        var params = {
            TableName: process.env.TABLE_CONVERSATION_TOPIC
        };
        ddb.scan(params, function(err, data) {
            console.log("================ RESULT GET ALL TOPIC ================", data);
            if (err) {
                console.error(err);
                reject(err);
            } else {
                var itemsUnwrap = data.Items.map(item => {
                    var itemUnwrap = attr.unwrap(item);
                    itemUnwrap.freeAnswer = itemUnwrap.freeAnswer != "";
                    itemUnwrap.userAction = itemUnwrap.userAction != "";
                    return itemUnwrap;
                });
                resolve(itemsUnwrap);
            }
        });
    })
}

exports.getLineTopic = function(idRefBloc) {
    return new Promise((resolve, reject) => {
        var params = {
            TableName: process.env.TABLE_CONVERSATION_TOPIC,
            Key: {
                'id': idRefBloc
            }
        };
        params.Key = attr.wrap(params.Key);
        ddb.getItem(params, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else if (data) {
                var lineTopic = data.Item;
                console.log("dynamodb lineTopic vaut", lineTopic);
                if (lineTopic) {
                    lineTopic = attr.unwrap(lineTopic);
                    console.log("line Topic apres unwrap", lineTopic);
                    lineTopic.blocConversation = JSON.parse(lineTopic.blocConversation);
                    if (lineTopic.blocConversation) {
                        lineTopic.blocConversation.freeAnswer = lineTopic.blocConversation.freeAnswer != "";
                        lineTopic.blocConversation.userAction = lineTopic.blocConversation.userAction != "";
                    }
                    console.log("line topic après json parse", lineTopic.blocConversation);
                }
                resolve(lineTopic);
            }
        });
    })
}


exports.insertLineTopic = function(lineTopic) {
    return new Promise((resolve, reject) => {
        var params = {
            TableName: process.env.TABLE_CONVERSATION_TOPIC,
            Item: {
                'id': lineTopic.blockRefMessageID + "" + lineTopic.conversationTitle,
                'conversationTitle': lineTopic.conversationTitle + "",
                'type': lineTopic.type + "",
                'category': lineTopic.category + "",
                'author': lineTopic.author + "",
                'descrition': lineTopic.description + "",
                'blockRefMessageID': lineTopic.blockRefMessageID + "",
                'blocConversation': JSON.stringify(lineTopic.blocConversation)
            }
        };
        params.Item = attr.wrap(params.Item);
        ddb.putItem(params, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(data.Item);
            }
        });
    })
}

exports.deleteBoxMessage = function(id) {
    return new Promise((resolve, reject) => {
        var params = {
            TableName: process.env.TABLE_CONVERSATION_TOPIC,
            Key: {
                'id': senderId,
            }
        };
        params.Key = attr.wrap(params.Key);
        ddb.delete(params, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}