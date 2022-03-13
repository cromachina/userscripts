// ==UserScript==
// @name         Twitter Remove Trends Panel
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Remove the in-your-face trends panel on the side of your feed.
// @author       Cromachina
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @grant        none
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @license      MIT
// ==/UserScript==
/*jshint esversion: 6 */

(function() {
    'use strict';
    // Constantly attempt to remove the trends panel, as navigating the site will regenerate it.
    setInterval(function ()
    {
        document.querySelector('div[aria-label="Timeline: Trending now"]')?.remove();
    }, 500);
})();
