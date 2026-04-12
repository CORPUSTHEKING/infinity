import { mountLayout } from '../../components/layout.js';
import { initRouter } from '../../components/router.js';
import { getManifest } from './data.js';

async function fetchJson(path) {
  const res = await fetch(path, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

async function loadConfig() {
  const [siteRes, formsRes, platformsRes, devicesRes] = await Promise.allSettled([
    fetchJson('./config/site.json'),
    fetchJson('./config/forms.json'),
    fetchJson('./config/platforms.json'),
    fetchJson('./config/devices.json')
  ]);

  const site = siteRes.status === 'fulfilled' ? siteRes.value : {};
  const forms = formsRes.status === 'fulfilled' ? formsRes.value.forms || {} : {};
  const platforms = platformsRes.status === 'fulfilled' ? platformsRes.value.platforms || [] : [];
  const devices = devicesRes.status === 'fulfilled' ? devicesRes.value.devices || [] : [];

  return {
    ...site,
    forms,
    platforms,
    devices
  };
}

function bindGlobalEvents(ui, config) {
  document.addEventListener('click', (e) => {
    const target = e.target;

    if (target.closest('[data-inf-menu-toggle]')) {
      const drawer = ui.root?.querySelector('[data-inf-drawer]') || document.querySelector('[data-inf-drawer]');
      if (drawer) ui.setDrawerVisible(drawer.hasAttribute('hidden'));
      return;
    }

    const drawer = ui.root?.querySelector('[data-inf-drawer]') || document.querySelector('[data-inf-drawer]');
    if (drawer && !drawer.hasAttribute('hidden')) {
      if (!target.closest('.inf-drawer-inner') || target.closest('a')) {
        ui.setDrawerVisible(false);
      }
    }

    if (target.closest('[data-inf-search-toggle], .inf-searchfab')) {
      const dock = ui.root?.querySelector('[data-inf-searchdock]') || document.querySelector('[data-inf-searchdock]');
      if (dock && dock.classList.contains('is-open')) {
        ui.closeSearch();
      } else {
        ui.openSearch();
      }
      return;
    }

    const actionBtn = target.closest('[data-action]');
    if (actionBtn) {
      const action = actionBtn.getAttribute('data-action');
      const inCard = Boolean(actionBtn.closest('[data-script-card]'));

      if (inCard && action === 'download') {
        return;
      }

      if (action === 'share' && navigator.share) {
        navigator.share({
          title: config.site_name || 'Infinity',
          url: window.location.href
        }).catch(() => {});
        return;
      }

      if (action) {
        window.location.hash = action;
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      ui.closeSearch();
    }

    if (e.key === 'Enter' && e.target.matches('input[data-inf-search-input]')) {
      e.preventDefault();
      const query = e.target.value.trim();

      if (query) {
        window.location.hash = `search?q=${encodeURIComponent(query)}`;
        ui.closeSearch();
        ui.setSearchValue('');
      }
    }
  });
}

async function bootstrap() {
  const root = document.getElementById('app');
  if (!root) {
    console.error('Root #app element not found');
    return;
  }

  const configPromise = loadConfig();
  void getManifest();

  const config = await configPromise;
  const ui = mountLayout(root, config);

  bindGlobalEvents(ui, config);
  initRouter(ui, config);
}

function start() {
  void bootstrap();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
