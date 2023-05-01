'use strict';

const nodeFetch = require('node-fetch');

exports.putStartedButton = function() {
    return new Promise(function(resolve, reject) {

        const responsePayload = {
            get_started: {
                payload: "WelcomeEvent"
            }
        };

        const url = "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=" + process.env.PAGE_ACCESS_TOKEN;

        nodeFetch(
                url, {
                    method: 'POST',
                    body: JSON.stringify(responsePayload),
                    headers: { 'Content-Type': 'application/json' }
                }
            )
            .then(res => {
                console.log("res vaul ", res);
                resolve(res);
            })
            .then(json => {
                console.log("Json result ", json);
                resolve(json);
            })
            .catch(error => {
                console.error("Call failed ", error);
                reject(error);
            });
    })
}

exports.putNestedMenus = function() {
    return new Promise(function(resolve, reject) {

        const responsePayload = {
            persistent_menu: [{
                locale: "default",
                composer_input_disabled: false,
                call_to_actions: [{
                        title: "🎨 Mes thèmes",
                        type: "postback",
                        payload: "PAYBILL_PAYLOAD"
                    },
                    {
                        title: "⚙️ Paramètres",
                        type: "nested",
                        call_to_actions: [{
                                title: "🤙 Partager Darewin",
                                type: "postback",
                                payload: "HISTORY_PAYLOAD"
                            },
                            {
                                title: "📧 Nous contacter",
                                type: "web_url",
                                url: "http://darewin.life/#faq",
                                webview_height_ratio: "full"
                            },
                            {
                                type: "web_url",
                                title: "🖐️ Aide",
                                url: "http://darewin.life",
                                webview_height_ratio: "full"
                            }
                        ]
                    }
                ]
            }]
        };

        const url = "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=" + process.env.PAGE_ACCESS_TOKEN;

        nodeFetch(
                url, {
                    method: 'POST',
                    body: JSON.stringify(responsePayload),
                    headers: { 'Content-Type': 'application/json' }
                }
            )
            .then(res => {
                console.log("res vaul ", res);
                resolve(res);
            })
            .then(json => {
                console.log("Json result ", json);
                resolve(json);
            })
            .catch(error => {
                console.error("Call failed ", error);
                reject(error);
            });
    })
}

exports.markSeens = function(senderId) {
    return new Promise(function(resolve, reject) {

        const responsePayload = {
            recipient: {
                id: senderId
            },
            sender_action: "mark_seen"
        };

        send(responsePayload).then(data => resolve(data)).catch(error => reject(error));
    })
}

exports.sendTxtMsg = function(senderId, msg, isTyping) {
    return new Promise(async function(resolve, reject) {

        const responsePayload = {
            recipient: {
                id: senderId
            },
            message: {
                text: msg
            }
        };

        send(responsePayload).then(function(data) {
            console.log("MESSAGE SEND");
            resolve(data)
        });
    })
}


exports.sendQuickReplies = function(senderId, msg, quickReplies, isTyping) {
    return new Promise(async function(resolve, reject) {

        console.log("quick replies vaut: ", quickReplies);
        console.log(typeof quickReplies);
        if (Array.isArray(quickReplies)) {
            console.log("C'est un tableau !");
        } else {
            console.log("Ce n'est pas un tableau =( !");
            quickReplies = quickReplies.replace(/'/g, '"');
            console.log("quickReplies vaut ", quickReplies);
            quickReplies = JSON.parse(quickReplies);
        }

        const responsePayload = {
            recipient: {
                id: senderId
            },
            message: {
                text: msg,
                quick_replies: quickReplies.map(reply => {
                    return {
                        "content_type": "text",
                        "title": reply.msg,
                        "payload": reply.refConv,
                    };
                })
            }
        };



        sendWithoutPromise(responsePayload);
        resolve();
    })
}

exports.sendGif = function(senderId, url) {
    return new Promise(function(resolve, reject) {

        const responsePayload = {
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "image",
                    payload: {
                        "url": url,
                        "is_reusable": true
                    }
                }
            }
        };

        send(responsePayload).then(function(data) {
            resolve(data)
        });
    })
}

exports.sendTemplate = function(senderId, elements, templateType) {
    return new Promise(function(resolve, reject) {

        console.log("elements vaut ", elements);
        console.log("elements vaut elements[0]", elements[0]);
        console.log("elements vaut elements[0].default_action", elements[0].default_action);

        const responsePayload = {
            "recipient": {
                "id": senderId
            },
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": templateType,
                        "elements": elements
                    }
                }
            }
        };

        send(responsePayload).then(function(data) {
            resolve(data)
        });
    })
}

exports.sendUrlButton = function(senderId, message, url, titleButton) {
    return new Promise(function(resolve, reject) {

        const responsePayload = {
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: message,
                        buttons: [{
                            type: "web_url",
                            url: url,
                            title: titleButton,
                            webview_height_ratio: "full"
                        }]
                    }
                }
            }
        };

        console.log("sendUrlButton responsePayload", responsePayload);

        send(responsePayload).then(function(data) {
            resolve(data)
        });
    })
}


exports.sendShareButton = function(senderId, title, subtitle, imageUrl, buttonUrl, buttonTitle) {
    return new Promise(function(resolve, reject) {

        const responsePayload = {
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [{
                            title: title,
                            subtitle: subtitle,
                            image_url: imageUrl,
                            buttons: [{
                                type: "element_share",
                                share_contents: {
                                    attachment: {
                                        type: "template",
                                        payload: {
                                            template_type: "generic",
                                            elements: [{
                                                title: title,
                                                subtitle: subtitle,
                                                image_url: imageUrl,
                                                default_action: {
                                                    type: "web_url",
                                                    url: buttonUrl
                                                },
                                                buttons: [{
                                                    type: "web_url",
                                                    url: buttonUrl,
                                                    title: buttonTitle
                                                }]
                                            }]
                                        }
                                    }
                                }
                            }]
                        }]
                    }
                }
            }
        };

        console.log("sendShareButton responsePayload", responsePayload);

        send(responsePayload).then(function(data) {
            resolve(data)
        });
    })
}


exports.typingOn = function(senderId) {
    return new Promise(function(resolve, reject) {

        const responsePayload = {
            recipient: {
                id: senderId
            },
            sender_action: "typing_on"
        };

        send(responsePayload).then(data => resolve(data)).catch(error => reject(error));
    })
}

exports.typingOff = function(senderId) {
    return new Promise(function(resolve, reject) {

        const responsePayload = {
            recipient: {
                id: senderId
            },
            sender_action: "typing_off"
        };


        send(responsePayload).then(data => resolve(data)).catch(error => reject(error));
    })
}


var send = function(responsePayload) {
    return new Promise((resolve, reject) => {

        const url = `https://graph.facebook.com/v2.6/me/messages?access_token=` + process.env.PAGE_ACCESS_TOKEN;

        nodeFetch(
                url, {
                    method: 'POST',
                    body: JSON.stringify(responsePayload),
                    headers: { 'Content-Type': 'application/json' }
                }
            ).then(res => {
                return res.json();
            })
            .then(json => {
                resolve(json);
            })
            .catch(error => {
                console.error("Call failed ", error);
                reject(error);
            });
    })
}

var sendWithoutPromise = function(responsePayload) {

    const url = `https://graph.facebook.com/v2.6/me/messages?access_token=` + process.env.PAGE_ACCESS_TOKEN;

    nodeFetch(
        url, {
            method: 'POST',
            body: JSON.stringify(responsePayload),
            headers: { 'Content-Type': 'application/json' }
        }
    )
}