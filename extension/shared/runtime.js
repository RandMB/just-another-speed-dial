/* eslint strict: 0 */

'use strict';

(function w() {
    function sendMessage(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (data) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                } else {
                    resolve(data);
                }
            });
        });
    }

    function getUrl(url) {
        return chrome.runtime.getURL(url);
    }

    function OnMessage() { }

    OnMessage.prototype.addListener = function OnMessageAddListener(func) {
        chrome.runtime.onMessage.addListener(func);
    };

    OnMessage.prototype.removeListener = function OnMessageRemoveListener(func) {
        chrome.runtime.onMessage.removeListener(func);
    };

    const exported = {
        sendMessage,
        onMessage: new OnMessage(),
        getUrl,
    };

    if ( typeof module !== "undefined" ) { 
        module.exports = exported;
    } else if ( typeof exports !== "undefined" ) {
        exports = exported;
    }

    window.runtime = exported;
}());
