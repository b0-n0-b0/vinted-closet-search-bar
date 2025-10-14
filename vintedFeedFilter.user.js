// ==UserScript==
// @name         Vinted Feed Filter
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Filter Vinted items by title in real-time
// @author       b0n0b0 + fixer
// @match        https://www.vinted.it/member/*
// @match        https://www.vinted.com/member/*
// @match        https://www.vinted.fr/member/*
// @match        https://www.vinted.pl/member/*
// @match        https://www.vinted.es/member/*
// @match        https://www.vinted.de/member/*
// @grant        none
// @updateURL    https://github.com/b0-n0-b0/vinted-closet-search-bar/raw/main/vintedFeedFilter.user.js
// @downloadURL  https://github.com/b0-n0-b0/vinted-closet-search-bar/raw/main/vintedFeedFilter.user.js
// ==/UserScript==

(function() {
    'use strict';
    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Filter items...';
    searchInput.style.cssText = `
        padding: 5px;
        color:black;
        margin-right:2px;
        border: 2px solid #ddd;
        border-radius: 4px;
        border-color:#007782;
        font-size: 14px;
        box-sizing: border-box;
    `;
    const filterCounter = document.createElement("p")
    // Wait for page to load
    function init() {
        if (document.body) {
            setupFilter();

            const searchbarDomObserver = new MutationObserver(() => {
                const target = document.querySelector('[data-testid="closet-buyer-filters"]');

                if (target) {
                    target.lastChild.appendChild(searchInput)
                    searchbarDomObserver.disconnect()
                }
            });

            searchbarDomObserver.observe(document.body, { childList: true, subtree: true });

            const counterbarDomObserver = new MutationObserver(() => {
                const counter = document.querySelector("#content > div > div.container > div > div:nth-child(3) > div.profile__items-wrapper > div.u-z-index-isolate > div.web_ui__Container__container > div > div > h2") || document.querySelector("#content > div > div.u-z-index-isolate > div.web_ui__Container__container > div > div > h2")
                if (counter){
                    counter.appendChild(filterCounter)
                    counterbarDomObserver.disconnect()
                }
            });

            counterbarDomObserver.observe(document.body, { childList: true, subtree: true });

        } else {
            setTimeout(init, 100);
        }
    }

    function setupFilter() {
        let filterTimeout;

        function filterItems() {
            const query = searchInput.value.toLowerCase().trim();
            const feedGrid = document.querySelector('.feed-grid');

            if (!feedGrid) return;

            const items = feedGrid.querySelectorAll('[data-testid="grid-item"]');
            let visibleCount = 0;

            items.forEach(item => {
                const titleElement = item.querySelector('[data-testid$="--description-title"]');

                if (!titleElement) return;

                const title = titleElement.textContent.toLowerCase();

                if (query === '' || title.includes(query)) {
                    item.style.display = '';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });
                filterCounter.textContent = ` Showing ${visibleCount} element${(visibleCount != 1) ? "s" : ""}`
            }

        // Filter on input with debounce
        searchInput.addEventListener('input', () => {
            clearTimeout(filterTimeout);
            filterTimeout = setTimeout(filterItems, 150);
        });

        // Observe DOM changes for new items
        const observer = new MutationObserver(() => {
            clearTimeout(filterTimeout);
            filterTimeout = setTimeout(filterItems, 150);
        });

        // Start observing when feed grid appears
        function startObserving() {
            const feedGrid = document.querySelector('.feed-grid');
            if (feedGrid) {
                observer.observe(feedGrid, {
                    childList: true,
                    subtree: true
                });
                filterItems();
            } else {
                setTimeout(startObserving, 500);
            }
        }

        startObserving();
    }

    init();
})();
