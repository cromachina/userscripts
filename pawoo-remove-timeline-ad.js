// ==UserScript==
// @name         Pawoo remove timeline ad
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Remove that annoying ad at the bottom of the timeline that takes up a lot of space
// @author       cro
// @match        https://pawoo.net/*
// @icon         https://www.google.com/s2/favicons?domain=pawoo.net
// @grant        none
// @license      MIT
// ==/UserScript==
/* jshint esversion: 6 */

(function() {
    'use strict';
    let process = () => void document.querySelector('div.pawoo-kyoa-home')?.remove();
    setInterval(process, 1000);
})();