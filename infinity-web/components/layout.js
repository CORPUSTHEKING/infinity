import { renderDrawer } from './drawer.js';
import { renderHero } from './hero.js';
import { renderQuickRail } from './quickrail.js';
import { renderSearchDock } from './searchdock.js';
import { renderSummary } from './summary.js';

export function createLayoutShell(config = {}) {
  const siteName = config.site_name || 'INFINITY';
  const ui = config.ui || {};
  const showBottomBar = ui.show_bottom_bar !== false;
  const showBottomSearch = ui.show_bottom_search !== false;

  return `
    <div class="inf-shell" data-inf-shell>
      <header class="inf-brandbar" data-inf-brandbar>
        <div class="inf-logo-wrapper">
          <span class="inf-symbol">∞</span>
        </div>
        <button type="button" class="inf-menu-btn" data-inf-menu-toggle aria-label="Menu">
          menu
        </button>
      </header>

      ${renderQuickRail(config)}
      ${renderDrawer(config)}

      <section class="inf-hero" data-inf-hero>
        ${renderHero(config)}
      </section>

      <section class="inf-summary" data-inf-summary style="display: none;">
        ${renderSummary(config.summary || {})}
      </section>

      <main class="inf-main" data-inf-main></main>

      ${showBottomSearch ? renderSearchDock() : ''}

      ${showBottomBar ? `
        <footer class="inf-bottombar curved" data-inf-bottombar>
          <div class="inf-bottombar-inner">
            <a href="#assistance">home</a>
            <a href="#upload">upload</a>
            <a href="#download">downloads</a>
          </div>
        </footer>
      ` : ''}
    </div>
  `;
}

export function mountLayout(root, config = {}) {
  root.innerHTML = createLayoutShell(config);

  const shell = root.querySelector('[data-inf-shell]');
  const brandbar = root.querySelector('[data-inf-brandbar]');
  const quickRail = root.querySelector('[data-inf-quickrail]');
  const drawer = root.querySelector('[data-inf-drawer]');
  const searchDock = root.querySelector('[data-inf-searchdock]');
  const searchPanel = root.querySelector('[data-inf-searchpanel]');
  const searchInput = root.querySelector('[data-inf-search-input]');
  const main = root.querySelector('[data-inf-main]');

  return {
    root,
    shell,
    brandbar,
    quickRail,
    drawer,
    searchDock,
    searchPanel,
    searchInput,
    main,
    setHero(html) {
      const hero = root.querySelector('[data-inf-hero]');
      if (hero) hero.innerHTML = html;
    },
    setSummary(html) {
      const summary = root.querySelector('[data-inf-summary]');
      if (summary) summary.innerHTML = html;
    },
    setPageContent(html) {
      const target = main || root.querySelector('[data-inf-main]');
      if (target) target.innerHTML = html;
    },
    setDrawerVisible(visible) {
      if (drawer) {
        drawer.hidden = !visible;
        drawer.classList.toggle('is-open', Boolean(visible));
      }
    },
    setSearchValue(value = '') {
      if (searchInput) searchInput.value = value;
    },
    openSearch() {
      const dock = searchDock || root.querySelector('[data-inf-searchdock]');
      const panel = searchPanel || root.querySelector('[data-inf-searchpanel]');
      if (dock) dock.classList.add('is-open');
      if (panel) panel.hidden = false;
      searchInput?.focus({ preventScroll: true });
    },
    closeSearch() {
      const dock = searchDock || root.querySelector('[data-inf-searchdock]');
      const panel = searchPanel || root.querySelector('[data-inf-searchpanel]');
      if (dock) dock.classList.remove('is-open');
      if (panel) panel.hidden = true;
    }
  };
}
