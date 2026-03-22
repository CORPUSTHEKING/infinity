export function createLayoutShell(config = {}) {
  const nav = Array.isArray(config.navigation) ? config.navigation : [];
  const admin = config.admin_contacts || {};
  const siteName = config.site_name || 'Infinity';

  return `
    <div class="inf-shell" data-inf-shell>
      <header class="inf-topbar" data-inf-topbar>
        <div class="inf-topbar-left">
          <a class="inf-logo" href="#assistance" aria-label="${siteName} home">${siteName}</a>
          <button type="button" class="inf-chip" data-inf-search-toggle>Search</button>
        </div>

        <div class="inf-topbar-center">
          <span class="inf-topbar-kicker">Workspace • Scripts • Requests • Sharing</span>
        </div>

        <div class="inf-topbar-right">
          <button type="button" class="inf-chip" data-inf-menu-toggle>Menu</button>
          <a class="inf-chip inf-chip-accent" href="#sponsor">Sponsor</a>
        </div>
      </header>

      <div class="inf-floating-logo" data-inf-floating-logo hidden>
        <a href="#assistance">${siteName}</a>
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
          <p class="inf-hero-eyebrow">Infinity Terminal Helpers</p>
          <h1>Portable workspace, script library, and community actions in one contained system.</h1>
          <p class="inf-hero-text">
            Search, download, upload, request, review, report, and share from a single layout that stays fast on mobile.
          </p>
          <div class="inf-hero-actions">
            <a href="#download" class="inf-hero-btn">Browse scripts</a>
            <a href="#iwl" class="inf-hero-btn inf-hero-btn-soft">I Would Like</a>
          </div>
        </div>

        <div class="inf-hero-marquee" aria-hidden="true">
          <span>Terminal helpers</span>
          <span>Rolling cards</span>
          <span>Fuzzy + regex search</span>
          <span>Uploads by schema</span>
          <span>Community sharing</span>
        </div>
      </section>

      <section class="inf-summary" data-inf-summary></section>

      <main class="inf-main" data-inf-main></main>

      <section class="inf-searchbar" data-inf-searchbar>
        <input type="search" data-inf-search-input placeholder="Search scripts, authors, shells, descriptions..." />
        <button type="button" data-inf-search-filters>Filters</button>
      </section>

      <footer class="inf-bottombar" data-inf-bottombar>
        <a href="#assistance">Home</a>
        <a href="#upload">Upload</a>
        <a href="#download">Downloads</a>
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
  const searchBar = root.querySelector('[data-inf-searchbar]');
  const searchInput = root.querySelector('[data-inf-search-input]');
  const summaryHost = root.querySelector('[data-inf-summary]');

  const updateScrollUI = () => {
    const currentY = window.scrollY || 0;
    const hideTop = currentY > 32;
    topbar?.classList.toggle('is-hidden', hideTop);
    floatingLogo.hidden = !hideTop;
    searchBar?.classList.toggle('is-hidden', currentY > 32);
    shell?.classList.toggle('is-scrolled', currentY > 32);
  };

  menuToggle?.addEventListener('click', () => {
    if (drawer) drawer.hidden = !drawer.hidden;
  });

  searchToggle?.addEventListener('click', () => {
    searchInput?.focus();
  });

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  return {
    root,
    shell,
    topbar,
    floatingLogo,
    drawer,
    searchBar,
    searchInput,
    summaryHost,
    setSummary(html) {
      if (summaryHost) summaryHost.innerHTML = html;
    },
    setPageContent(html) {
      const main = root.querySelector('[data-inf-main]');
      if (main) main.innerHTML = html;
    },
    setDrawerVisible(visible) {
      if (drawer) drawer.hidden = !visible;
    }
  };
}
