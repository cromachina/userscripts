// ==UserScript==
// @name         Twitter Show All Replies
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Automatically click 'show more replies'
// @author       cro
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @grant        none
// @license      MIT
// ==/UserScript==
/* jshint esversion: 6 */

(function() {
    'use strict';
    let path_match = new RegExp('^/.+/status/\\d+$');

    let click_show_more = function()
    {
        if (!window.location.pathname.match(path_match))
        {
            return;
        }
        let nodes = document.querySelector('main[role="main"] section')?.lastChild?.firstChild?.children;
        if (!nodes)
        {
            return;
        }
        for (let node of nodes)
        {
            if (node.querySelector('[data-testid="tweet"]'))
            {
                continue;
            }
            node.querySelector('[role="button"]')?.click()
        }
    };

    setInterval(click_show_more, 500);
})();
