// ==UserScript==
// @name         Twitter media-only filter toggle.
// @version      0.18
// @description  Toggle non-media tweets on and off on the home timeline, for the power-viewer!
// @author       Cro
// @match        https://*.twitter.com/*
// @match        https://*.x.com/*
// @run-at       document-idle
// @grant        GM_setValue
// @grant        GM_getValue
// @namespace https://greasyfork.org/users/10865
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/39130/Twitter%20media-only%20filter%20toggle.user.js
// @updateURL https://update.greasyfork.org/scripts/39130/Twitter%20media-only%20filter%20toggle.meta.js
// ==/UserScript==
/* jshint esversion: 6 */

(function() {
    let storage_key = "cro-media-toggle";
    let show_all = GM_getValue(storage_key);

    let create_ui = function(target)
    {
        let button = document.createElement("button");
        button.innerText = show_all ? "Showing all home tweets" : "Showing only media home tweets";

        button.onclick = function(event)
        {
            show_all = !show_all;
            GM_setValue(storage_key, show_all);
            location.reload();
        };

        target.prepend(button);
    };

    let find_objects_at_keys = function(obj, keys)
    {
        let found = [];
        let stack = Object.entries(obj);
        while (stack.length > 0)
        {
            let current = stack.pop();
            if (keys.includes(current[0]))
            {
                found.push(current[1]);
            }
            if (current[1] != null && typeof(current[1]) == 'object')
            {
                stack = stack.concat(Object.entries(current[1]));
            }
        }
        return found;
    };

    let get_result = (obj) => obj?.content?.itemContent?.tweet_results?.result;
    let get_quoted_result = (obj) => get_result(obj)?.quoted_status_result?.result;
    let has_media_property = (result) => result?.legacy?.entities?.hasOwnProperty('media');
    let has_media = (obj) =>
        obj.entryId.includes("cursor-") ||
        has_media_property(get_result(obj)) ||
        has_media_property(get_quoted_result(obj));

    let update_data = function(data)
    {
        if (show_all || location.pathname != '/home')
        {
            return;
        }
        for (let obj of find_objects_at_keys(data, ['instructions']))
        {
            for (let subobj of obj)
            {
                if (subobj.hasOwnProperty('entries'))
                {
                    subobj.entries = subobj.entries.filter(has_media);
                }
            }
        }
    };

    let old_parse = JSON.parse;
    let unsafe_window_parse = unsafeWindow.JSON.parse;
    let new_unsafe_window_parse = function(string)
    {
        let data = old_parse(string);
        try
        {
            if (data != null)
            {
                update_data(data);
            }
        }
        catch(error)
        {
            console.log(error);
        }
        return unsafe_window_parse(JSON.stringify(data));;
    };
    exportFunction(new_unsafe_window_parse, unsafeWindow.JSON, { defineAs: "parse" });

    // Wait for twitter's react crap finish loading things.
    let scan_interval = setInterval(function()
    {
        let target = document.body.querySelector("nav[role='navigation']");
        if (target)
        {
            clearInterval(scan_interval);
            create_ui(target);
        }
    }, 10);
})();
