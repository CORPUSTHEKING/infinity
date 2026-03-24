import { mountLayout } from '../../components/layout.js';
import { bindDrawerToggle } from '../../components/drawer.js';
import { bindQuickRail } from '../../components/quickrail.js';
import { normalizeRoute, onRouteChange } from '../../components/router.js';
import { searchItems } from '../../components/search.js';
import { renderCategoriesView, renderSearchResultsView } from '../../components/categories.js';
import { bindCardActions } from '../../components/cardActions.js';
import { bindSearchDock } from '../../components/searchdock.js';
import { getState, setState } from '../../components/state.js';

const appRoot = document.getElementById('app');

async function loadJson(path) {
  try {
    const response = await fetch(`./config/${path}`);
    return response.ok ? await response.json() : {};
  } catch (e) { return {}; }
}

const flattenTree = (nodes) => nodes.reduce((acc, n) => {
  if (n.type === 'file') acc.push(n);
  if (n.children) acc.push(...flattenTree(n.children));
  return acc;
}, []);

async function init() {
  const [site, scripts, platforms, devices] = await Promise.all([
    loadJson('site.json'), loadJson('scripts.json'), loadJson('platforms.json'), loadJson('devices.json')
  ]);

  const layout = mountLayout(appRoot, site);
  const scriptTree = scripts.tree || [];
  const indexFields = scripts.index_fields || ['name', 'description'];

  bindDrawerToggle({ drawer: layout.drawer, button: appRoot.querySelector('[data-inf-menu-toggle]') });

  bindSearchDock({
    dock: layout.searchDock,
    input: layout.searchInput,
    toggleButton: appRoot.querySelector('[data-inf-search-toggle]'),
    onChange: (val) => {
      setState({ query: val });
      if (normalizeRoute(window.location.hash) === 'search') renderRoute('search', val);
    }
  });

  function renderRoute(route, queryOverride = '') {
    const cleanRoute = normalizeRoute(route);
    const query = queryOverride || getState().query || '';
    let html = '';

    layout.setSummary(`
      <div class="inf-summary-grid">
        <article class="inf-summary-card"><strong>${scripts.categories?.length || 0}</strong><span>categories</span></article>
        <article class="inf-summary-card"><strong>${(platforms.platforms || []).length}</strong><span>platforms</span></article>
        <article class="inf-summary-card"><strong>${(devices.devices || []).length}</strong><span>devices</span></article>
      </div>
    `);

    if (cleanRoute === 'search') {
      const visible = searchItems(flattenTree(scriptTree), query, { fields: indexFields });
      html = renderSearchResultsView(visible, query);
    } else {
      html = renderCategoriesView(scriptTree);
    }

    layout.setPageContent(html);
    bindCardActions(appRoot.querySelector('[data-inf-main]'), {
      onAction: (action, id) => console.log(`Action ${action} on ${id}`)
    });
  }

  onRouteChange(renderRoute);
}
init();
