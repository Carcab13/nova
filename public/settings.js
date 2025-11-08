"use strict";

// Cookie utility functions
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Settings Manager
class SettingsManager {
    constructor() {
        this.defaults = {
            background: 'img.jpg',
            searchEngine: 'https://www.google.com/search?q=%s'
        };
        this.init();
    }

    init() {
        // Load saved settings or use defaults
        const savedBg = getCookie('novaProxy_background');
        const savedSearch = getCookie('novaProxy_searchEngine');
        
        // Apply settings to current page
        this.applyBackground(savedBg || this.defaults.background);
        this.applySearchEngine(savedSearch || this.defaults.searchEngine);
        
        // Setup event listeners for settings page
        if (document.querySelector('.settings-container')) {
            this.setupSettingsPage(savedBg, savedSearch);
        }
    }

    applyBackground(bgUrl) {
        const body = document.body;
        if (body) {
            body.style.backgroundImage = `url('${bgUrl}')`;
            body.style.backgroundAttachment = 'fixed';
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundRepeat = 'no-repeat';
        }
    }

    applySearchEngine(searchUrl) {
        const searchEngineInput = document.getElementById('sj-search-engine');
        if (searchEngineInput) {
            searchEngineInput.value = searchUrl;
        }
    }

    setupSettingsPage(savedBg, savedSearch) {
        // Setup background options
        const bgOptions = document.querySelectorAll('.bg-option');
        bgOptions.forEach(option => {
            const bgUrl = option.dataset.bg;
            option.addEventListener('click', () => {
                this.selectBackground(bgUrl);
            });
            
            // Mark active option
            if ((savedBg || this.defaults.background) === bgUrl) {
                option.classList.add('active');
            }
        });

        // Setup custom background input
        const customBgInput = document.getElementById('custom-bg-url');
        const applyCustomBg = document.getElementById('apply-custom-bg');
        if (applyCustomBg) {
            applyCustomBg.addEventListener('click', () => {
                const customUrl = customBgInput.value.trim();
                if (customUrl) {
                    this.selectBackground(customUrl);
                    // Clear active states
                    bgOptions.forEach(opt => opt.classList.remove('active'));
                }
            });
        }

        // Setup search engine radio buttons
        const searchRadios = document.querySelectorAll('input[name="search-engine"]');
        searchRadios.forEach(radio => {
            if (radio.value === (savedSearch || this.defaults.searchEngine)) {
                radio.checked = true;
            }
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.selectSearchEngine(radio.value);
                }
            });
        });

        // Setup custom search input
        const customSearchInput = document.getElementById('custom-search-url');
        const applyCustomSearch = document.getElementById('apply-custom-search');
        if (applyCustomSearch) {
            applyCustomSearch.addEventListener('click', () => {
                const customUrl = customSearchInput.value.trim();
                if (customUrl && customUrl.includes('%s')) {
                    this.selectSearchEngine(customUrl);
                    // Uncheck all radio buttons
                    searchRadios.forEach(radio => radio.checked = false);
                } else {
                    alert('Custom search URL must include %s for the query parameter');
                }
            });
        }

        // Setup reset button
        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all settings to defaults?')) {
                    this.resetSettings();
                }
            });
        }
    }

    selectBackground(bgUrl) {
        setCookie('novaProxy_background', bgUrl);
        this.applyBackground(bgUrl);
        
        // Update active state on settings page
        const bgOptions = document.querySelectorAll('.bg-option');
        bgOptions.forEach(opt => {
            if (opt.dataset.bg === bgUrl) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    selectSearchEngine(searchUrl) {
        setCookie('novaProxy_searchEngine', searchUrl);
        this.applySearchEngine(searchUrl);
    }

    resetSettings() {
        deleteCookie('novaProxy_background');
        deleteCookie('novaProxy_searchEngine');
        
        this.applyBackground(this.defaults.background);
        this.applySearchEngine(this.defaults.searchEngine);
        
        // Reload settings page UI if on settings page
        if (document.querySelector('.settings-container')) {
            location.reload();
        }
    }

    getSettings() {
        return {
            background: getCookie('novaProxy_background') || this.defaults.background,
            searchEngine: getCookie('novaProxy_searchEngine') || this.defaults.searchEngine
        };
    }
}

// Initialize settings manager
const settingsManager = new SettingsManager();

