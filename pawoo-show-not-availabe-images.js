// ==UserScript==
// @name         Pawoo show 'Not Available' images
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Inlines images that are shown as 'not available' particularly from Misskey servers.
// @author       cro
// @match        https://pawoo.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pawoo.net
// @grant        none
// @license      MIT
// ==/UserScript==
/* jshint esversion: 6 */

(function() {
    'use strict';

    let inline_images = function()
    {
        for (let media_node of document.querySelectorAll('a.media-gallery__item-thumbnail'))
        {
            if (!media_node.querySelector('img'))
            {
                let img = document.createElement('img');
                img.src = media_node.href;
                media_node.appendChild(img);
                media_node.querySelector('canvas')?.remove();
                media_node.closest('div.media-gallery').querySelector('.spoiler-button')?.remove();
            }
        }
    };

    setInterval(inline_images, 250);
})();