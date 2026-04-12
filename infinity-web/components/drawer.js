import { escapeHTML } from './utils/html.js';

export function renderDrawer(config = {}) {
  const nav = Array.isArray(config.navigation) ? config.navigation : [];
  const admin = config.admin_contacts || {};
  const siteName = config.site_name || 'Infinity';

  return `
    <aside class="inf-drawer" data-inf-drawer hidden>
      <div class="inf-drawer-inner">
        <div class="inf-drawer-head">
          <strong>${escapeHTML(siteName)}</strong>
          <span>Admin: ${escapeHTML(admin.primary_email || '')}</span>
        </div>

        <nav class="inf-drawer-nav" aria-label="Primary">
          ${nav
            .map((item) => {
              const key = escapeHTML(item.key || '');
              const label = escapeHTML(item.label || item.key || '');
              return `<a href="#${key}" data-route="${key}">${label}</a>`;
            })
            .join('')}
        </nav>
      </div>
    </aside>
  `;
}

export function bindDrawerToggle({ drawer, button } = {}) {
  if (!drawer || !button) {
    return {
      open() {},
      close() {},
      toggle() {},
      isOpen() {
        return false;
      }
    };
  }

  const sync = () => {
    drawer.hidden = Boolean(drawer.hidden);
  };

  const open = () => {
    drawer.hidden = false;
  };

  const close = () => {
    drawer.hidden = true;
  };

  const toggle = () => {
    drawer.hidden = !drawer.hidden;
  };

  button.addEventListener('click', toggle);

  document.addEventListener(
    'pointerdown',
    (event) => {
      if (drawer.hidden) return;
      if (drawer.contains(event.target) || button.contains(event.target)) return;
      close();
    },
    { capture: true }
  );

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  sync();

  return {
    open,
    close,
    toggle,
    isOpen() {
      return !drawer.hidden;
    }
  };
}
