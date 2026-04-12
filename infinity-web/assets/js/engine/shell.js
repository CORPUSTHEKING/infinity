/**
 * INFINITY-ENGINE: Shell
 * Generates static persistent UI elements.
 */
const mapIcon = (k) => ({
    download: 'download',
    share: 'share-2',
    request: 'plus-circle',
    terminal: 'terminal'
})[k] || 'circle';

export const renderShell = (config) => {
    const { ui, quick_actions } = config.site;
    
    if (ui.show_bottom_bar) {
        const nav = `<nav class="inf-bottombar"><div class="inf-bottombar-inner">
            ${quick_actions.map(a => `
                <a href="#" data-key="${a.key}" class="nav-item">
                    <i data-lucide="${mapIcon(a.key)}"></i>
                </a>`).join('')}
        </div></nav>`;
        document.body.insertAdjacentHTML('beforeend', nav);
    }

    if (ui.show_bottom_search) {
        const search = `<div class="inf-searchdock" id="searchDock">
            <button class="inf-searchfab" id="searchFab"><i data-lucide="search"></i></button>
            <div class="inf-searchpanel"><input type="text" id="searchInput" placeholder="Fuzzy search..."></div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', search);
    }
};
