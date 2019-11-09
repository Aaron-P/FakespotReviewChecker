(async function () {
    "use strict";

    //#region Code from https://github.com/NiklasGollenstede/web-ext-utils/blob/master/utils/index.js#L19
    //By Niklas Gollenstede, Licensed under Mozilla Public License 2.0

    /// escapes a string for usage in a regular expression
    const escape = string => string.replace(/[\-\[\]\{\}\(\)\*\+\?\.\,\\\^\$\|\#]/g, '\\$&');

    /// matches all valid match patterns (except '<all_urls>') and extracts [ , scheme, host, path, ]
    const matchPattern = (/^(?:(\*|http|https|file|ftp|app):\/\/(\*|(?:\*\.)?[^\/\*]+|)\/(.*))$/i);

    /**
     * Transforms a valid match pattern into a regular expression which matches all URLs included by that pattern.
     * Passes all examples and counter-examples listed here https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Match_patterns#Examples
     * @param  {string}  pattern  The pattern to transform.
     * @return {RegExp}           The patterns equivalent as a RegExp.
     * @throws {TypeError}        If the pattern string is not a valid MatchPattern
     */
    function matchPatternToRegExp(pattern) {
        if (pattern === '<all_urls>') { return (/^(?:https?|file|ftp|app):\/\//); } // TODO: this is from mdn, check if chrome behaves the same
        const match = matchPattern.exec(pattern);
        if (!match) { throw new TypeError(`"${ pattern }" is not a valid MatchPattern`); }
        const [ , scheme, host, path, ] = match;
        return new RegExp('^(?:'
            + (scheme === '*' ? 'https?' : escape(scheme)) +':\/\/'
            + (host === '*' ? '[^\/]+?' : escape(host).replace(/^\\\*\\./g, '(?:[^\/]+?.)?'))
            + (path ? '\/'+ escape(path).replace(/\\\*/g, '.*') : '\/?')
        +')$');
    }

    //#endregion

    //#region Url Cleaners

    function cleanUrlAmazon(url) {
        let path = url.pathname.match(/(\/(?:dp|gp\/product)\/[^\/]+)/);
        if (path === null)
            return;

        let clean = new URL(url.origin);
        clean.pathname = path[1];
        return clean.href;
    }

    function cleanUrlTripAdvisor(url) {
        let path = url.pathname.match(/(\/(?:Attraction|Hotel|Restaurant)_Review-[^\/]+)/);
        if (path === null)
            return;

        let clean = new URL(url.origin);
        clean.pathname = path[1];
        return clean.href;
    }

    function cleanUrlWalmart(url) {
        let path = url.pathname.match(/\/ip(?:\/[^\/]*)?\/(\d+)$/);
        if (path === null)
            return;

        let clean = new URL(url.origin);
        clean.pathname = "/ip/" + path[1];
        return clean.href;
    }

    function cleanUrlYelp(url) {
        let path = url.pathname.match(/(\/biz\/[^\/]+)/);
        if (path === null)
            return;

        let clean = new URL(url.origin);
        clean.pathname = path[1];
        return clean.href;
    }

    function cleanUrlBestBuy(url) {
        let path = url.pathname.match(/\/site\/[^\/]+\/(\d+\.p)/);
        if (path === null)
            return;

        let clean = new URL(url.origin);
        clean.pathname = "/site/a/" + path[1];
        return clean.href
    }

    function cleanUrlSephora(url) {
        let path = url.pathname.match(/\/product\/[^\/]+\-(P\d+)/);
        if (path === null)
            return;

        let clean = new URL(url.origin);
        clean.pathname = "/product/a-" + path[1];
        return clean.href
    }

    function cleanUrlSteam(url) {
        let path = url.pathname.match(/\/app\/(\d+)/);
        if (path === null)
            return;

        let clean = new URL(url.origin);
        clean.pathname = "/app/" + path[1];
        return clean.href
    }

    function cleanBodyBuilding(url) {
        let path = url.pathname.match(/\/store\/([^\/]+)\/(.+?)\.html?/);
        if (path === null)
            return;

        let clean = new URL(url.origin);
        clean.pathname = "/store/" + path[1] + "/" + path[2] + ".html";
        return clean.href
    }

    //#endregion

    const cleanUrlHandlers = [
        { engines: ["reviewmeta.com"]                , pattern: matchPatternToRegExp("*://*.amazon.cn/*"            ), handler: cleanUrlAmazon      },
        { engines: ["reviewmeta.com"]                , pattern: matchPatternToRegExp("*://*.amazon.co.jp/*"         ), handler: cleanUrlAmazon      },
        { engines: ["reviewmeta.com"]                , pattern: matchPatternToRegExp("*://*.amazon.com.br/*"        ), handler: cleanUrlAmazon      },
        { engines: ["reviewmeta.com"]                , pattern: matchPatternToRegExp("*://*.amazon.com.mx/*"        ), handler: cleanUrlAmazon      },
        { engines: ["reviewmeta.com"]                , pattern: matchPatternToRegExp("*://*.amazon.de/*"            ), handler: cleanUrlAmazon      },
        { engines: ["reviewmeta.com"]                , pattern: matchPatternToRegExp("*://*.amazon.es/*"            ), handler: cleanUrlAmazon      },
        { engines: ["reviewmeta.com"]                , pattern: matchPatternToRegExp("*://*.amazon.fr/*"            ), handler: cleanUrlAmazon      },
        { engines: ["reviewmeta.com"]                , pattern: matchPatternToRegExp("*://*.amazon.it/*"            ), handler: cleanUrlAmazon      },
        { engines: ["reviewmeta.com"]                , pattern: matchPatternToRegExp("*://*.amazon.nl/*"            ), handler: cleanUrlAmazon      },
        { engines: ["reviewmeta.com"]                , pattern: matchPatternToRegExp("*://*.bodybuilding.com/*"     ), handler: cleanBodyBuilding   },
        { engines: ["fakespot.com", "reviewmeta.com"], pattern: matchPatternToRegExp("*://*.amazon.ca/*"            ), handler: cleanUrlAmazon      },
        { engines: ["fakespot.com", "reviewmeta.com"], pattern: matchPatternToRegExp("*://*.amazon.co.uk/*"         ), handler: cleanUrlAmazon      },
        { engines: ["fakespot.com", "reviewmeta.com"], pattern: matchPatternToRegExp("*://*.amazon.com.au/*"        ), handler: cleanUrlAmazon      },
        { engines: ["fakespot.com", "reviewmeta.com"], pattern: matchPatternToRegExp("*://*.amazon.com/*"           ), handler: cleanUrlAmazon      },
        { engines: ["fakespot.com", "reviewmeta.com"], pattern: matchPatternToRegExp("*://*.amazon.in/*"            ), handler: cleanUrlAmazon      },
        { engines: ["fakespot.com"]                  , pattern: matchPatternToRegExp("*://*.bestbuy.com/*"          ), handler: cleanUrlBestBuy     },
        { engines: ["fakespot.com"]                  , pattern: matchPatternToRegExp("*://*.sephora.com/*"          ), handler: cleanUrlSephora     },
        { engines: ["fakespot.com"]                  , pattern: matchPatternToRegExp("*://*.tripadvisor.com/*"      ), handler: cleanUrlTripAdvisor },
        { engines: ["fakespot.com"]                  , pattern: matchPatternToRegExp("*://*.walmart.com/*"          ), handler: cleanUrlWalmart     },
        { engines: ["fakespot.com"]                  , pattern: matchPatternToRegExp("*://*.yelp.ca/*"              ), handler: cleanUrlYelp        },
        { engines: ["fakespot.com"]                  , pattern: matchPatternToRegExp("*://*.yelp.co.uk/*"           ), handler: cleanUrlYelp        },
        { engines: ["fakespot.com"]                  , pattern: matchPatternToRegExp("*://*.yelp.com/*"             ), handler: cleanUrlYelp        },
        { engines: ["fakespot.com"]                  , pattern: matchPatternToRegExp("*://store.steampowered.com/*" ), handler: cleanUrlSteam       }
    ];

    function getCleanUrl(engines, tab) {
        let url;
        try {
            url = new URL(tab.url);
            // Remove parts that we for sure don't need.
            url.username = "";
            url.password = "";
            url.hash = "";
        } catch (error) { }

        if (!url)
            return;

        let handler = cleanUrlHandlers.find(handler => handler.pattern.test(url.href));
        if (!handler)
            return;

        let handlerEngines = engines.filter(engine => handler.engines.includes(engine));
        if (handlerEngines.length < 1)
            return;//Handler doesn't work form any of the given engines.

        let cleanUrl = handler.handler(url);
        return { url: cleanUrl, engines: handlerEngines };
    }

    async function initPageAction(tab) {
        browser.pageAction.hide(tab.id);

        const options = await browser.storage.local.get({
            optIn: false,
            engine: "fakespot.com"
        });
        const engines = options.engine.split("|");

        // Strip out unneeded url data.
        let cleanUrl = getCleanUrl(engines, tab);
        if (!cleanUrl)
            return;

        /*
        const iconUrl = await browser.runtime.getURL("icon.svg");
        console.log(iconUrl);
        const theme = await browser.theme.getCurrent();
        console.log(theme);
        await browser.pageAction.setIcon({
            tabId: tab.id,
            path: iconUrl
        });
        */

        //ehhh
        const title =
            cleanUrl.engines.includes("fakespot.com") &&
            cleanUrl.engines.includes("reviewmeta.com") ? "Analyze with Fakespot and ReviewMeta" :
            cleanUrl.engines.includes("fakespot.com")   ? "Analyze with Fakespot"                :
            cleanUrl.engines.includes("reviewmeta.com") ? "Analyze with ReviewMeta"              : null;

        browser.pageAction.setTitle({
            tabId: tab.id,
            title: title
        });

        // Only show the pageAction if the user has opted-in.
        if (!options.optIn)
            return;
        await browser.pageAction.show(tab.id);
    }

    // Send the user to the proper fakespot page if they click the button.
    browser.pageAction.onClicked.addListener(async (tab) => {
        const options = await browser.storage.local.get({
            engine: "fakespot.com"
        });
        const engines = options.engine.split("|");

        let cleanUrl = getCleanUrl(engines, tab);
        if (!cleanUrl)
            return;

        if (cleanUrl.engines.includes("fakespot.com"))
            await browser.tabs.create({ url: "https://fakespot.com/analyze?url=" + encodeURIComponent(cleanUrl.url) });
        if (cleanUrl.engines.includes("reviewmeta.com"))
            await browser.tabs.create({ url: "https://reviewmeta.com/search?q=" + encodeURIComponent(cleanUrl.url) });
    });

    // Re-init page action when options change.
    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        // For some reason window.close() isn't working on the opt-in page, so we'll close it here.
        if (message.close)
            await browser.tabs.remove(sender.tab.id);

        const tabs = await browser.tabs.query({/* url: [] patterns? */})
        tabs.forEach(async (tab) => await initPageAction(tab));

        sendResponse({
            pong: message.ping
        });
    });

    // Init page action on all existing tabs.
    {
        const tabs = await browser.tabs.query({/* url: [] patterns? */})
        tabs.forEach(async (tab) => await initPageAction(tab));
    }

    // Re-init page action when tab changes.
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => await initPageAction(tab));

    // TODO: Do this on an install event instead?
    // If the user hasn't been prompted to opt-in yet then show the prompt.
    {
        const results = await browser.storage.local.get({
            optInShown: false
        });

        if (!results.optInShown) {
            let height = 200;
            let width = 500;

            let dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
            let dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;
            let screenWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            let screenHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
            let left = ((screenWidth / 2) - (width / 2)) + dualScreenLeft;
            let top = ((screenHeight / 2) - (height / 2)) + dualScreenTop;

            await browser.windows.create({
                allowScriptsToClose: true,
                height: height,
                width: width,
                left: left,
                top: top,
                type: "popup",
                url: "src/opt-in.html"
            });
        }
    }

}());