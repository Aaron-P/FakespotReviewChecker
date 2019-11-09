(async function () {
    "use strict";

    const optIn  = document.getElementById("opt-in");
    const engine = document.getElementById("engine");

    optIn.addEventListener("change", function () {
        browser.storage.local.set({
            optIn: this.checked
        }).then(() => {
            let nonce = parseInt(new Date().getTime().toString() + ((Math.random() * 1e5) | 0), 10).toString(36);
            browser.runtime.sendMessage({ ping: nonce });
        }, error => console.error(error));
    });

    engine.addEventListener("change", function () {
        browser.storage.local.set({
            engine: this.value
        }).then(() => {
            let nonce = parseInt(new Date().getTime().toString() + ((Math.random() * 1e5) | 0), 10).toString(36);
            browser.runtime.sendMessage({ ping: nonce });
        }, error => console.error(error));
    });

    document.addEventListener("DOMContentLoaded", () => {
        browser.storage.local.get({
            optIn: false,
            engine: "fakespot.com"
        }).then(results => {
            optIn.checked = results.optIn;
            engine.value = results.engine;
        }, error => console.error(error));
    });
}());