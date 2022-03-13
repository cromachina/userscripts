// ==UserScript==
// @name         Pixiv extended dashboard statistics.
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Put view-ratio data on likes, bookmarks, etc.
// @author       cro
// @match        https://www.pixiv.net/*
// @icon         https://www.google.com/s2/favicons?domain=pixiv.net
// @grant        none
// @license      MIT
// ==/UserScript==
/* jshint esversion: 6 */

(function() {
    'use strict';
    let chunk = function(array, chunk_size)
    {
        if (chunk_size < 1) chunk_size = 1;
        let result = [];
        let temp = [];
        array.forEach(function(elm, i)
        {
            temp.push(elm);
            if (temp.length == chunk_size || (i == array.length - 1))
            {
                result.push(temp);
                temp = [];
            }
        });
        return result;
    };

    let make_set_ratio = function(container_query)
    {
        let get_container = function(node)
        {
            let id_name = "cro-id-75dhs85";
            let maybe_child = node.querySelector(`span[id=${id_name}]`);
            if (maybe_child) return maybe_child;
            let child = document.createElement('span');
            child.id = id_name;
            let container = node.querySelector(container_query) || node;
            container.append(child);
            return child;
        };
        let count = function (node)
        {
            let data = node.querySelector(container_query) || node;
            return parseInt(data.textContent.replace(',', ''));
        };
        return function(target_node, denom_node)
        {
            if (target_node && denom_node) get_container(target_node).textContent = ` (${(count(target_node) / count(denom_node) * 100).toFixed(2)}%)`;
        };
    };
    let query_array = (selector) => Array.from(document.querySelectorAll(selector).values());

    let process_all = function()
    {
        if (window.location.pathname == "/dashboard/works")
        {
            // Desktop view
            if (document.querySelector('[class*=sc-1b2i4p6-0]'))
            {
                let set_ratio = make_set_ratio('a');
                let indices = query_array('div[class*=gtm-dashboard-works-sort-select]');
                let get_index = function(name)
                {
                    let node = document.querySelector(`div[class*=gtm-dashboard-works-sort-select-${name}]`);
                    let i = indices.indexOf(node);
                    return i == -1 ? null : i - 1;
                };
                let view_index = get_index('view');
                let like_index = get_index('rating');
                let bookmark_index = get_index('bookmark');
                let rows = chunk(query_array('div[class*=sc-1b2i4p6-25]'), indices.length + 1);
                rows = rows.map(row => row.slice(2));
                for (let row of rows)
                {
                    let view = row[view_index];
                    set_ratio(row[like_index], view);
                    set_ratio(row[bookmark_index], view);
                }
            }
            // Mobile view
            else if (document.querySelector('[class*=sc-18qovzs-0]'))
            {
                let set_ratio = make_set_ratio('div[class*=sc-18qovzs-13]');
                let cell_nodes = query_array('div[class*=sc-18qovzs-7]');
                for (let cell of cell_nodes)
                {
                    let view = cell.querySelector('a[href*=access]');
                    let like = cell.querySelector('a[href*=rating]');
                    let bookmark = cell.querySelector('a[href*=bookmark]');
                    set_ratio(like, view);
                    set_ratio(bookmark, view);
                }
            }
        }
        else if (window.location.pathname == "/dashboard")
        {
            let set_ratio = make_set_ratio('span[class*=zpz4nj-2]');
            let cell_nodes = query_array('div[class*=h8luo8-6]');
            for (let cell of cell_nodes)
            {
                let [view, like, bookmark] = cell.querySelectorAll('a[class*=gtm-dashboard-home-latest]');
                set_ratio(like, view);
                set_ratio(bookmark, view);
            }
        }
    };

    setInterval(process_all, 500);
})();