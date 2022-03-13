// ==UserScript==
// @name         Tools
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tools that I use to analyze sites
// @author       cro
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @license      MIT
// ==/UserScript==

'use strict';
let make_obj_prop_record = function(obj, prop, path)
{
    let result = {};
    result.path = Array.from(path);
    result.parent = obj;
    result.prop = prop;
    result.value = obj[prop];
    result.set = (new_val) => { result.value = obj[prop] = new_val; };
    result.call = (...args) => obj[prop].apply(obj, args);
    result.setcall = (new_val) => typeof obj[prop] == "function" ? result.call(new_val) : result.set(new_val)
    return result;
};

let obj_search = function(root, matcher)
{
    let visited = new WeakSet();
    let found = [];
    let path = [];
    let search = function(obj)
    {
        let type = typeof obj;
        if (!obj || type !== 'object') return;
        if (visited.has(obj)) return;
        visited.add(obj);
        for (let prop in obj)
        {
            try
            {
                let val = obj[prop];
                path.push(prop);
                if (matcher(prop, val)) found.push(make_obj_prop_record(obj, prop, path));
                search(val);
                path.pop();
            } catch(e) {}
        }
    };

    let t = performance.now();
    search(root);
    console.log((performance.now() - t) / 1000);
    return found;
};

let key_search = function(root, target, exact)
{
    let expr = exact ? `^${target}` : target;
    let regex = new RegExp(expr, "i");
    return obj_search(root, (prop, val) => regex.test(prop));
};

let val_search = function(root, target)
{
    return obj_search(root, (prop, val) => val == target);
};

let tw_key = "tw_followers";

let follower_collector = () =>
{
    let get_instructions = obj => obj.data.user.result.timeline.timeline.instructions;
    let get_entries = obj => get_instructions(obj).find(i => i.type == 'TimelineAddEntries').entries;
    let get_legacy_data = entry => entry.content.itemContent.user_results.result.legacy;
    let is_follower_item = item => item.content.entryType == "TimelineTimelineItem";
    let make_minimal_record = (store, data) =>
    {
        if (data.followed_by)
        {
            store[data.screen_name] = [data.followers_count, data.following];
        }
    };

    let store = GM_getValue(tw_key);
    if (!store)
    {
        store = {};
    }

    let process_data = data =>
    {
        get_entries(data)
            .filter(is_follower_item)
            .map(get_legacy_data)
            .forEach(data => make_minimal_record(store, data));

        GM_setValue(tw_key, store);
    };

    const old_open = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function()
    {
        if (arguments[1].includes("/Followers"))
        {
            this.addEventListener('load', function()
            {
                try
                {
                    process_data(JSON.parse(this.responseText));
                }
                catch (error)
                {
                    console.error(error);
                };
            });
        }
        old_open.apply(this, arguments);
    };

};

if (window.location.hostname == 'twitter.com')
{
    follower_collector();
}

let get_store = function()
{
    return GM_getValue(tw_key);
};

var lib =
{
    obj_search : obj_search,
    key_search : key_search,
    val_search : val_search,
    get_store : get_store,
};

unsafeWindow.crohelpers = lib;