// ==UserScript==
// @name         Pawoo show 'Not Available' images
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Attempt to fix the issue where images show as 'Not Available' on Pawoo.
// @author       cro
// @match        https://pawoo.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pawoo.net
// @grant        none
// @license      MIT
// ==/UserScript==
/* jshint esversion: 6 */

(function() {
    'use strict';

    let fix_media = function(media)
    {
        if (media.type == 'unknown')
        {
            media.url = media.remote_url;
            media.preview_url = media.remote_url;
            media.preview_remote_url = media.remote_url;
            media.type = 'image';
        }
    };

    let fix_status = function(status)
    {
        status.media_attachments.forEach(fix_media);
        if (status.reblog)
        {
            status.reblog.media_attachments.forEach(fix_media);
        }
    };

    let safe_call = function(f)
    {
        try { f(); } catch {}
    };

    let old_parse = JSON.parse;
    JSON.parse = function(str)
    {
        let obj = old_parse(str);
        safe_call(() => obj.forEach(fix_status));
        safe_call(() => fix_status(obj));
        return obj;
    }
})();