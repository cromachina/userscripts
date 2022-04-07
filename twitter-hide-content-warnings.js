// ==UserScript==
// @name         Twitter hide content warning crap
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Hide that annoying box. Also get rid of that blur filter.
// @author       You
// @match        https://*.twitter.com/*
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @grant        none
// @license      MIT
// ==/UserScript==
/* jshint esversion: 6 */

(function() {
    'use strict';
    setInterval(function ()
    {
        document.querySelectorAll('a[href*="appeal_tweet_warning"]').forEach(node => node.closest('div.r-14gqq1x').remove());
        document.querySelectorAll('div[role="button"].r-173mn98').forEach(node => node.click());
        document.querySelectorAll('div[role="button"].r-e1k2in').forEach(node => node.remove());
    }, 250);

    // Wrap this entire call so that we do not disrupt the website with errors.
    let safe_call = function(fn, arg)
    {
        try
        {
            fn(arg);
        }
        catch
        {
        }
    };

    let legacy_data_mod = function(legacy)
    {
        legacy.possibly_sensitive = false;
        let media_data = legacy.extended_entities.media;
        for (let media of media_data)
        {
            delete media.sensitive_media_warning;
        }
    };

    let timeline_entries_mod = function(entries)
    {
        for (let entry of entries)
        {
            let legacy = entry?.content?.itemContent?.tweet_results?.result?.legacy;
            safe_call(legacy_data_mod, legacy);
            safe_call(legacy_data_mod, legacy?.retweeted_status_result?.result?.legacy);
        }
    }

    let media_mod = function(tw_response)
    {
        let entries = tw_response.data.user.result.timeline_v2.timeline.instructions[0].entries;
        timeline_entries_mod(entries);
    };

    let tweets_mod = function(tw_response)
    {
        let entries = tw_response.data.user.result.timeline.timeline.instructions[0].entries;
        timeline_entries_mod(entries);
    };

    let tweet_detail_mod = function(tw_response)
    {
        let entries = tw_response.data.threaded_conversation_with_injections.instructions[0].entries;
        timeline_entries_mod(entries);
    };

    // Modifying data on the home page is not working. I'm not sure what field twitter is looking at,
    // but these are the only reasonable ones that I could find. The above "click" will hand any leftovers.
    let tweet_data_mod = function(tweet)
    {
        tweet.possibly_sensitive = false;
        let media_data = tweet.extended_entities.media;
        for (let media of media_data)
        {
            media.ext_sensitive_media_warning = null;
        }
    };

    let global_mod = function(tw_response)
    {
        for (let tweet in tw_response.globalObjects.tweets)
        {
            safe_call(tweet_data_mod, tweet);
        }
    };

    // Intercept JSON parses to alter the sensitive media data.
    let old_parse = JSON.parse;
    JSON.parse = function(string)
    {
        let data = old_parse(string);
        safe_call(media_mod, data);
        safe_call(tweets_mod, data);
        safe_call(tweet_detail_mod, data);
        safe_call(global_mod, data);
        return data;
    };
})();