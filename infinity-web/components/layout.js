import { renderDrawer } from './drawer.js';
import { renderHero } from './hero.js';
import { renderQuickRail } from './quickrail.js';
import { renderSearchDock } from './searchdock.js';
import { renderSummary } from './summary.js';

export function createLayoutShell(config = {}) {
  const siteName = config.site_name || 'Infinity';

  return `
    <div class="inf-shell" data-inf-shell>
      <header class="inf-brandbar" data-inf-brandbar>
        <button type="button" class="inf-brandbar-toggle" data-inf-brandbar-toggle aria-label="Open Infinity home">
          <span class="inf-logo">∞</span>
          <span class="inf-brand-word">${siteName}</span>
        </button>
      </header>

      ${renderQuickRail(config)}
      ${renderDrawer(config)}

      <section class="inf-hero" data-inf-hero>
        ${renderHero(siteName)}
      </section>

      <section class="inf-summary" data-inf-summary>
        ${renderSummary()}
      </section>

      <main class="inf-main" data-inf-main></main>

      ${renderSearchDock()}

      <footer class="inf-bottombar" data-inf-bottombar>
        <a href="#assistance">home</a>
        <a href="#upload">upload</a>
        <a href="#download">downloads</a>
      </footer>
    </div>
  `;
}

export function mountLayout(root, config = {}) {
  root.innerHTML = createLayoutShell(config);

  const shell = root.querySelector('[data-inf-shell]');
  const brandbar = root.querySelector('[data-inf-brandbar-toggle]');
  const quickRail = root.querySelector('[data-inf-quickrail]');
  const drawer = root.querySelector('[data-inf-drawer]');
  const searchDock = root.querySelector('[data-inf-searchdock]');
  const searchPanel = root.querySelector('[data-inf-searchpanel]');
  const searchInput = root.querySelector('[data-inf-search-input]');

  return {
    root,
    shell,
    brandbar,
    quickRail,
    drawer,
    searchDock,
    searchPanel,
    searchInput,
    setHero(html) {
      const hero = root.querySelector('[data-inf-hero]');
      if (hero) hero.innerHTML = html;
    },
    setSummary(html) {
      const summary = root.querySelector('[data-inf-summary]');
      if (summary) summary.innerHTML = html;
    },
    setPageContent(html) {
      const main = root.querySelector('[data-inf-main]');
      if (main) main.innerHTML = html;
    },
    setDrawerVisible(visible) {
      if (drawer) drawer.hidden = !visible;
    },
    setSearchValue(value = '') {
      if (searchInput) searchInput.value = value;
    },
    openSearch() {
      const dock = root.querySelector('[data-inf-searchdock]');
      const panel = root.querySelector('[data-inf-searchpanel]');
      if (dock) dock.classList.add('is-open');
      if (panel) panel.hidden = false;
      searchInput?.focus();
    },
    closeSearch() {
      const dock = root.querySelector('[data-inf-searchdock]');
      const panel = root.querySelector('[data-inf-searchpanel]');
      if (dock) dock.classList.remove('is-open');
      if (panel) panel.hidden = true;
    }
  };
}
