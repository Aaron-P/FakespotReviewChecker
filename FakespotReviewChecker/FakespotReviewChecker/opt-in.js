(function () {
"use strict";

    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("button-accept").addEventListener("click", () => {
            browser.storage.local.set({
                optIn: true,
                optInShown: true
            }).then(() => {
                let nonce = parseInt(new Date().getTime().toString() + ((Math.random() * 1e5) | 0), 10).toString(36);
                browser.runtime.sendMessage({ ping: nonce, close: true });
                window.close();
            }, error => console.error(error));
        });

        document.getElementById("button-cancel").addEventListener("click", () => {
            browser.storage.local.set({
                optIn: false,
                optInShown: true
            }).then(() => {
                let nonce = parseInt(new Date().getTime().toString() + ((Math.random() * 1e5) | 0), 10).toString(36);
                browser.runtime.sendMessage({ ping: nonce, close: true });
                window.close();
            }, error => console.error(error));
        });
    });
}());