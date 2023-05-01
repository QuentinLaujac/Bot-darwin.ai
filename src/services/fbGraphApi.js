'use strict';

const nodeFetch = require('node-fetch');

exports.getCustomerInformations = function(senderId) {
    return new Promise(function(resolve, reject) {
        const url = 'https://graph.facebook.com/v2.6/' + senderId + '?fields=first_name,last_name,profile_pic&access_token=' + process.env.PAGE_ACCESS_TOKEN;

        nodeFetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => {
                return res.json();
            }).then(json => {
                console.log("json vaut", json);
                if (json && json.id) {
                    var user = {};
                    user.firstname = json.first_name;
                    user.lastname = json.last_name;
                    user.profilePic = json.profile_pic;
                    user.id = json.id;
                }
                resolve(user);
            })
            .catch(error => {
                console.error("Call failed ", error);
                reject(error);
            });

    })
}