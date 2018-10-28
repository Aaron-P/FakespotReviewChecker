(function() {
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

    function cleanUrlAmazon(url) {
        let path = url.pathname.match(/(\/(?:dp|gp\/product)\/[^\/]+)/);
        if (path === null)
            return;

        url.search = "";
        url.pathname = path[1];
        return url.href;
    }

    function cleanUrlTripAdvisor(url) {
        let path = url.pathname.match(/(\/(?:Attraction|Hotel|Restaurant)_Review-[^\/]+)/);
        if (path === null)
            return;

        url.search = "";
        url.pathname = path[1];
        return url.href;
    }

    function cleanUrlYelp(url) {
        let path = url.pathname.match(/(\/biz\/[^\/]+)/);
        if (path === null)
            return;

        url.search = "";
        url.pathname = path[1];
        return url.href;
    }

    function cleanUrlItunes(url) {
        let path = url.pathname.match(/\/app\/(?:[^\/]+\/)*(id\d+)/);
        if (path === null)
            return;

        url.pathname = "/app/" + path[1];
        url.search = "";
        return url.href;
    }

    const cleanUrlHandlers = [
        { pattern: matchPatternToRegExp("*://*.amazon.ca/*")      , handler: cleanUrlAmazon      },
        { pattern: matchPatternToRegExp("*://*.amazon.co.uk/*")   , handler: cleanUrlAmazon      },
        { pattern: matchPatternToRegExp("*://*.amazon.com.au/*")  , handler: cleanUrlAmazon      },
        { pattern: matchPatternToRegExp("*://*.amazon.com/*")     , handler: cleanUrlAmazon      },
        { pattern: matchPatternToRegExp("*://*.amazon.in/*")      , handler: cleanUrlAmazon      },
        { pattern: matchPatternToRegExp("*://*.tripadvisor.com/*"), handler: cleanUrlTripAdvisor },
        { pattern: matchPatternToRegExp("*://*.yelp.ca/*")        , handler: cleanUrlYelp        },
        { pattern: matchPatternToRegExp("*://*.yelp.co.uk/*")     , handler: cleanUrlYelp        },
        { pattern: matchPatternToRegExp("*://*.yelp.com/*")       , handler: cleanUrlYelp        },
        { pattern: matchPatternToRegExp("*://itunes.apple.com/*") , handler: cleanUrlItunes      }
    ];

    function getCleanUrl(tab) {
        let url;
        try {
            url = new URL(tab.url);
        } catch (error) { }

        if (!url)
            return;

        let handler = cleanUrlHandlers.find(handler => handler.pattern.test(url.href));
        if (!handler)
            return;

        let cleanUrl = handler.handler(url);
        return cleanUrl;
    }

    function initPageAction(tab) {
        browser.pageAction.hide(tab.id);

        let cleanUrl = getCleanUrl(tab);
        if (!cleanUrl)
            return;

        browser.pageAction.setTitle({
            tabId: tab.id,
            title: "Analyze with Fakespot"
        });
        browser.pageAction.show(tab.id);
    }

    browser.pageAction.onClicked.addListener(tab => {
        let cleanUrl = getCleanUrl(tab);
        if (!cleanUrl)
            return;

        browser.tabs.create({
            url: "https://fakespot.com/analyze?url=" + encodeURIComponent(cleanUrl)
        });
    });

    browser.tabs.query({}).then(tabs => {
        tabs.forEach(tab => initPageAction(tab));
    });

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => initPageAction(tab));
}());