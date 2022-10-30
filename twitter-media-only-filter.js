// ==UserScript==
// @name         Twitter media-only filter toggle.
// @version      0.11
// @description  Toggle non-media tweets on and off on the home timeline, for the power-viewer!
// @author       Cro
// @match        https://twitter.com/*
// @run-at       document-idle
// @grant        GM_setValue
// @grant        GM_getValue
// @namespace https://greasyfork.org/users/10865
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @license      MIT
// ==/UserScript==
/* jshint esversion: 6 */

(function() {
    'use strict';
    let storage_key = "cro-media-toggle";
    let show_all = GM_getValue(storage_key);
    let has_photo = node => node.querySelector('[data-testid="tweetPhoto"]');
    let has_video = node => node.querySelector('[data-testid="videoPlayer"]');
    let has_card_media = node => node.querySelector('[data-testid*="media"]');
    let has_media = node => [has_photo, has_video, has_card_media].some(f => f(node));
    let get_target_parent = node => node.parentNode.parentNode.parentNode;
    let for_each_article = func => void document.body.querySelectorAll("article").forEach(func);
    let set_article_state = node => void(get_target_parent(node).style.display = show_all || has_media(node) ? "block" : "none");
    let set_all_article_states = () => void for_each_article(set_article_state);

    let create_ui = function(target)
    {
        let button = document.createElement("button");
        let set_button_state = () => { button.innerText = show_all ? "Showing all home tweets" : "Showing only media home tweets"; };

        button.onclick = function(event)
        {
            show_all = !show_all;
            GM_setValue(storage_key, show_all);
            set_button_state();
        };

        target.prepend(button);
        set_button_state();
    };

    let start_process = function()
    {
        setInterval(function()
        {
            if (location.pathname == "/home")
            {
                set_all_article_states();
            }
        }, 250);
    };

    // Wait for twitter's react crap finish loading things.
    let scan_interval = setInterval(function()
    {
        let target = document.body.querySelector("h1[role='heading']");
        if (target)
        {
            clearInterval(scan_interval);
            start_process(target);
            create_ui(target);
        }
    }, 10);
})();
