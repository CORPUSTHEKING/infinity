import { mountLayout } from '../../components/layout.js';
import { bindDrawerToggle } from '../../components/drawer.js';
import { bindQuickRail } from '../../components/quickrail.js';
import { bindScrollChrome } from '../../components/scroll.js';
import { normalizeRoute, onRouteChange } from '../../components/router.js';
import { searchItems } from '../../components/search.js';
import { renderCategoriesView, renderSearchResultsView } from '../../components/categories.js';
import { bindCardActions } from '../../components/cardActions.js';
import { bindSearchDock } from '../../components/searchdock.js';
import { bindAutosave, serializeForm } from '../../components/forms.js';
import { getState, setState } from '../../components/state.js';

import { renderDownloadPage } from '../../pages/download.js';
import { renderSharePage } from '../../pages/share.js';
import { renderUploadPage } from '../../pages/upload.js';
import { renderRequestPage } from '../../pages/request.js';
import { renderPlatformsPage } from '../../pages/platforms.js';
import { renderDevicesPage } from '../../pages/devices.js';

const appRoot = document.getElementById('app');

// 🛡️ SAFE JSON LOADER: Returns empty object instead of crashing on 404
async function loadJson(path) {
  try {
    const response = await fetch(`./config/${path}`);
    if (!response.ok) return {};
    return await response.json();
  } catch (e) {
    console.warn(`[Infinity] Failed to load ${path}`);
    return {};
  }
}

async function init() {
  // 1. Load Data Safely (No Top-Level Await!)
  const [siteConfig, scriptsConfig, platformsConfig, devicesConfig, formsConfig] = await Promise.all([
    loadJson('site.json'),
    loadJson('scripts.json'),
    loadJson('platforms.json'),
    loadJson('devices.json'),
    loadJson('forms.json')
  ]);

  // 2. Mount UI
  const layout = mountLayout(appRoot, siteConfig);
  const scriptTree = scriptsConfig.tree || [];
  const indexFields = scriptsConfig.index_fields || ['name', 'path'];

  const quickRail = bindQuickRail({
    rail: layout.quickRail,
    shell: layout.shell,
    onOpen: () => setState({ quickRailOpen: true }),
    onClose: () => setState({ quickRailOpen: false })
  });

  bindDrawerToggle({
    drawer: layout.drawer,
    button: appRoot.querySelector('[data-inf-menu-toggle]')
  });

  bindScrollChrome({ shell: layout.shell, threshold: 18 });

  layout.brandbar?.addEventListener('click', (e) => {
    e.preventDefault();
    quickRail.open();
    window.location.hash = '#assistance';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const searchDock = bindSearchDock({
    dock: layout.searchDock,
    panel: layout.searchPanel,
    input: layout.searchInput,
    toggleButton: appRoot.querySelector('[data-inf-search-toggle]'),
    onChange: (value) => {
      setState({ query: value });
      if (normalizeRoute(window.location.hash) === 'search') renderRoute('search', value);
    }
  });

  function renderRoute(route, queryOverride = '') {
    const cleanRoute = normalizeRoute(route);
    const query = queryOverride || getState().query || '';
    let html = '';

    setState({ route: cleanRoute, query });

    const live = scriptsConfig?.metadata?.total_categories || 0;
    layout.setSummary(`
      <div class="inf-summary-grid">
        <article class="inf-summary-card"><strong>${live}</strong><span>categories</span></article>
        <article class="inf-summary-card"><strong>${(platformsConfig.platforms || []).length}</strong><span>platforms</span></article>
        <article class="inf-summary-card"><strong>${(devicesConfig.devices || []).length}</strong><span>devices</span></article>
      </div>
    `);

    if (cleanRoute === 'assistance' || cleanRoute === 'home') {
      html = renderCategoriesView(scriptTree, { query });
    } else if (cleanRoute === 'download') {
      const flatten = (nodes) => nodes.reduce((acc, n) => {
        if (n.type === 'file') acc.push(n);
        if (n.children) acc.push(...flatten(n.children));
        return acc;
      }, []);
      html = renderDownloadPage(flatten(scriptTree));
    } else if (cleanRoute === 'search') {
      const flatten = (nodes) => nodes.reduce((acc, n) => {
        acc.push(n);
        if (n.children) acc.push(...flatten(n.children));
        return acc;
      }, []);
      const visible = searchItems(flatten(scriptTree), query, { fields: indexFields });
      html = renderSearchResultsView(visible, query);
    } else if (cleanRoute === 'share') {
      html = renderSharePage(formsConfig.forms?.share || {});
    } else if (cleanRoute === 'upload') {
      html = renderUploadPage(formsConfig.forms?.upload || {});
    } else if (cleanRoute === 'request') {
      html = renderRequestPage(formsConfig.forms?.request || {});
    } else if (cleanRoute === 'platforms') {
      html = renderPlatformsPage(platformsConfig.platforms || []);
    } else if (cleanRoute === 'devices') {
      html = renderDevicesPage(devicesConfig.devices || []);
    } else {
      html = renderCategoriesView(scriptTree, { query });
    }

    layout.setPageContent(html);

    const main = appRoot.querySelector('[data-inf-main]');
    if (main) {
      bindCardActions(main, {
        onExpand: (id, card) => card.classList.toggle('is-expanded'),
        onAction: (action, id) => {
          const findInTree = (nodes) => {
            for (const n of nodes) {
              if (n.id === id) return n;
              if (n.children) {
                const found = findInTree(n.children);
                if (found) return found;
              }
            }
          };
          const item = findInTree(scriptTree);
          if (action === 'download' && item) {
            import('../../components/cardActions.js').then(m => m.handleDownload(item, siteConfig));
          }
        }
      });
    }
  }

  onRouteChange(renderRoute);
}

// Start the app!
init();
