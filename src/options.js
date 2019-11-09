(async function () {
    "use strict";

    let optIn = document.getElementById("opt-in");
    optIn.addEventListener("change", function () {
        browser.storage.local.set({
            optIn: this.checked
        }).then(() => {
            let nonce = parseInt(new Date().getTime().toString() + ((Math.random() * 1e5) | 0), 10).toString(36);
            browser.runtime.sendMessage({ ping: nonce });
        }, error => console.error(error));
    });

    document.addEventListener("DOMContentLoaded", () => {
        browser.storage.local.get({
            optIn: false
        }).then(results => {
            optIn.checked = results.optIn;
        }, error => console.error(error));
    });
}());