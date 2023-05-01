'use strict';

exports.alarm = function(timeOut) {
    return new Promise(function(resolve, reject) {
        var startTime = Date.now();
        var interval = setInterval(function() {
            var timeElapse = Date.now() - startTime;
            if (timeElapse >= timeOut) {
                clearInterval(interval);
                return resolve();
            }
        }, 50);
    });
}