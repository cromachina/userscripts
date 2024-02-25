// ==UserScript==
// @name         Twitter hide content warning crap
// @namespace    http://tampermonkey.net/
// @version      0.11
// @description  Makes it so nothing is marked as sensitive.
// @author       cromachina
// @match        https://*.twitter.com/*
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @license      MIT
// ==/UserScript==
/* jshint esversion: 6 */

(function() {
    let find_objects_at_keys = function(obj, keys)
    {
        let found = [];
        let stack = Object.entries(obj);
        while (stack.length > 0)
        {
            let current = stack.pop();
            if (keys.indexOf(current[0] != -1))
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

    let fix_media = function(data)
    {
        for (let obj of find_objects_at_keys(data, ['media']))
        {
            if (!Array.isArray(obj))
            {
                continue;
            }
            for (let media of obj)
            {
                if (typeof media != 'object')
                {
                    continue;
                }
                delete media.sensitive_media_warning;
                media.ext_sensitive_media_warning = null;
            }
        };
    };

    // Intercept JSON parses to alter the sensitive media data.
    let old_parse = unsafeWindow.JSON.parse;
    let new_parse = function(string)
    {
        let data = old_parse(string);
        fix_media(data);
        return data;
    };
    exportFunction(new_parse, unsafeWindow.JSON, { defineAs: "parse" });
})();
