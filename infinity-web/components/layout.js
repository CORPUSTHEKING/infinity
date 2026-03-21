export function createLayoutShell(config = {}) {
  const nav = Array.isArray(config.navigation) ? config.navigation : [];
  const admin = config.admin_contacts || {};
  const siteName = config.site_name || 'Infinity';
  return `
    <div class="inf-shell" data-inf-shell>
      <header class="inf-topbar" data-inf-topbar>
        <div class="inf-brand">
          <a class="inf-logo" href="#home" aria-label="${siteName} home">${siteName}</a>
        </div>
        <div class="inf-top-actions">
          <button type="button" class="inf-icon-btn" data-inf-search-toggle>Search</button>
          <button type="button" class="inf-icon-btn" data-inf-menu-toggle>Menu</button>
        </div>
      </header>

      <div class="inf-floating-logo" data-inf-floating-logo hidden>
        <a href="#home">${siteName}</a>
      </div>

      <aside class="inf-drawer" data-inf-drawer hidden>
        <nav class="inf-drawer-nav" aria-label="Primary">
          ${nav.map(item => `<a href="#${item.key}" data-route="${item.key}">${item.label}</a>`).join('')}
        </nav>
        <div class="inf-drawer-meta">
          <div>Admin: ${admin.primary_email || ''}</div>
        </div>
      </aside>

      <section class="inf-hero" data-inf-hero>
        <div class="inf-hero-media" aria-hidden="true"></div>
        <div class="inf-hero-copy">
          <h1>${siteName}</h1>
          <p>Terminal helpers, scripts, requests, uploads, and community sharing in one place.</p>
        </div>
      </section>

      <main class="inf-main" data-inf-main></main>

      <section class="inf-searchbar" data-inf-searchbar>
        <input type="search" data-inf-search-input placeholder="Search scripts, authors, shells, descriptions..." />
        <button type="button" data-inf-search-filters>Filters</button>
      </section>

      <footer class="inf-bottombar" data-inf-bottombar>
        <a href="#profile">Profile</a>
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

  let lastScrollY = window.scrollY || 0;

  const updateScrollUI = () => {
    const currentY = window.scrollY || 0;
    const hideTop = currentY > 24;
    topbar?.classList.toggle('is-hidden', hideTop);
    floatingLogo.hidden = !hideTop;
    searchBar?.classList.toggle('is-hidden', currentY > 24);
    shell?.classList.toggle('is-scrolled', currentY > 24);
    lastScrollY = currentY;
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
    setPageContent(html) {
      const main = root.querySelector('[data-inf-main]');
      if (main) main.innerHTML = html;
    },
    setDrawerVisible(visible) {
      if (drawer) drawer.hidden = !visible;
    }
  };
}
