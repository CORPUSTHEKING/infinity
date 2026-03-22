export function createLayoutShell(config = {}) {
  const nav = Array.isArray(config.navigation) ? config.navigation : [];
  const admin = config.admin_contacts || {};
  const siteName = config.site_name || 'Infinity';

  return `
    <div class="inf-shell" data-inf-shell>
      <header class="inf-topbar" data-inf-topbar>
        <div class="inf-topbar-left">
          <a class="inf-logo" href="#assistance" aria-label="${siteName} home">∞</a>
        </div>

        <div class="inf-topbar-center">
          <nav class="inf-top-links" aria-label="Quick actions">
            <a href="#download">scripts</a>
            <a href="#share">share</a>
            <a href="#request">request</a>
            <a href="#disclaimer">configs</a>
          </nav>
        </div>

        <div class="inf-topbar-right">
          <button type="button" class="inf-chip" data-inf-search-toggle>search</button>
          <button type="button" class="inf-chip" data-inf-menu-toggle>menu</button>
        </div>
      </header>

      <div class="inf-floating-logo" data-inf-floating-logo hidden>
        <a href="#assistance">∞</a>
      </div>

      <aside class="inf-drawer" data-inf-drawer hidden>
        <div class="inf-drawer-head">
          <strong>${siteName}</strong>
          <span>Admin: ${admin.primary_email || ''}</span>
        </div>
        <nav class="inf-drawer-nav" aria-label="Primary">
          ${nav.map(item => `<a href="#${item.key}" data-route="${item.key}">${item.label}</a>`).join('')}
        </nav>
      </aside>

      <section class="inf-hero" data-inf-hero>
        <div class="inf-hero-media" aria-hidden="true"></div>
        <div class="inf-hero-overlay"></div>
        <div class="inf-hero-copy">
          <p class="inf-hero-eyebrow">LET’S ASSUME THIS IS AN ANDROID DEVICE</p>
          <h1>${siteName}</h1>
          <p class="inf-hero-text">
            Scripts, requests, uploads, sharing, and category browsing stay inside one compact layout.
          </p>
        </div>

        <div class="inf-hero-marquee" aria-hidden="true">
          <span>scripts</span>
          <span>share</span>
          <span>request</span>
          <span>configs</span>
          <span>search</span>
        </div>
      </section>

      <section class="inf-summary" data-inf-summary></section>

      <main class="inf-main" data-inf-main></main>

      <div class="inf-searchdock" data-inf-searchdock>
        <button type="button" class="inf-searchfab" data-inf-search-toggle aria-label="Open search">⌕</button>
        <div class="inf-searchpanel" data-inf-searchpanel>
          <input type="search" data-inf-search-input placeholder="Search scripts, authors, shells, descriptions..." />
          <button type="button" data-inf-search-filters>filters</button>
        </div>
      </div>

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
  const topbar = root.querySelector('[data-inf-topbar]');
  const floatingLogo = root.querySelector('[data-inf-floating-logo]');
  const drawer = root.querySelector('[data-inf-drawer]');
  const menuToggle = root.querySelector('[data-inf-menu-toggle]');
  const searchToggle = root.querySelector('[data-inf-search-toggle]');
  const searchDock = root.querySelector('[data-inf-searchdock]');
  const searchInput = root.querySelector('[data-inf-search-input]');
  const searchPanel = root.querySelector('[data-inf-searchpanel]');

  const syncSearchDock = () => {
    const open = searchDock?.classList.contains('is-open');
    if (searchPanel) searchPanel.hidden = !open;
  };

  const updateScrollUI = () => {
    const currentY = window.scrollY || 0;
    const hideTop = currentY > 28;
    topbar?.classList.toggle('is-hidden', hideTop);
    floatingLogo.hidden = !hideTop;
    shell?.classList.toggle('is-scrolled', currentY > 28);
  };

  const toggleSearchDock = () => {
    if (!searchDock) return;
    searchDock.classList.toggle('is-open');
    syncSearchDock();
    if (searchDock.classList.contains('is-open')) {
      searchInput?.focus();
    }
  };

  menuToggle?.addEventListener('click', () => {
    if (drawer) drawer.hidden = !drawer.hidden;
  });

  searchToggle?.addEventListener('click', toggleSearchDock);

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();
  syncSearchDock();

  return {
    root,
    shell,
    topbar,
    floatingLogo,
    drawer,
    searchDock,
    searchPanel,
    searchInput,
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
      if (!searchDock?.classList.contains('is-open')) {
        searchDock?.classList.add('is-open');
        syncSearchDock();
      }
      searchInput?.focus();
    },
    closeSearch() {
      searchDock?.classList.remove('is-open');
      syncSearchDock();
    }
  };
}
