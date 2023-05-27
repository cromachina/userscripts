// ==UserScript==
// @name         Pixiv remove dashboard confetti
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Remove the confetti effect on the dashboard status as it wastes GPU power.
// @author       You
// @match        https://www.pixiv.net/*
// @icon         https://www.google.com/s2/favicons?domain=pixiv.net
// @grant        none
// @license      MIT
// ==/UserScript==
/* jshint esversion: 6 */

(function() {
    'use strict';
    let process = () => void document.querySelector('canvas.sc-ef86180f-0')?.remove();
    setInterval(process, 1000);
})();