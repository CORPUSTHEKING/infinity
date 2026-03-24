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

import { renderAssistancePage } from '../../pages/assistance.js';
import { renderDownloadPage } from '../../pages/download.js';
import { renderSharePage } from '../../pages/share.js';
import { renderUploadPage } from '../../pages/upload.js';
import { renderRequestPage } from '../../pages/request.js';
import { renderReviewPage } from '../../pages/review.js';
import { renderReportPage } from '../../pages/report.js';
import { renderSponsorPage } from '../../pages/sponsor.js';
import { renderPlatformsPage } from '../../pages/platforms.js';
import { renderDevicesPage } from '../../pages/devices.js';
import { renderDisclaimerPage } from '../../pages/disclaimer.js';
import { renderTerminalPage } from '../../pages/terminal.js';
import { renderIwlPage } from '../../pages/iwl.js';

const appRoot = document.getElementById('app');

const jsonUrl = (path) => new URL(`../../config/${path}`, import.meta.url);

async function loadJson(path) {
  const response = await fetch(jsonUrl(path));
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

const [siteConfig, scriptsConfig, platformsConfig, devicesConfig, formsConfig] = await Promise.all([
  loadJson('site.json'),
  loadJson('scripts.json'),
  loadJson('platforms.json'),
  loadJson('devices.json'),
  loadJson('forms.json')
]);

const layout = mountLayout(appRoot, siteConfig);

const scriptItems = Array.isArray(scriptsConfig.scripts) ? scriptsConfig.scripts : [];
const configuredCategories = Array.isArray(scriptsConfig.categories) ? scriptsConfig.categories : [];
const indexFields = Array.isArray(scriptsConfig.index_fields) ? scriptsConfig.index_fields : [];

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

bindScrollChrome({
  shell: layout.shell,
  threshold: 18
});

layout.brandbar?.addEventListener('click', () => {
  quickRail.open();
  window.location.hash = '#assistance';
});

const searchDock = bindSearchDock({
  dock: layout.searchDock,
  panel: layout.searchPanel,
  input: layout.searchInput,
  toggleButton: appRoot.querySelector('[data-inf-search-toggle]'),
  onChange: (value) => {
    setState({ query: value });
    if (normalizeRoute(window.location.hash) === 'search') {
      renderRoute('search', value);
    }
  },
  onOpen: () => setState({ searchOpen: true }),
  onClose: () => setState({ searchOpen: false })
});

function summaryHtml() {
  const live = scriptsConfig?.counts?.live ?? scriptItems.length;
  const total = scriptsConfig?.counts?.total ?? scriptItems.length;

  return `
    <div class="inf-summary-grid">
      <article class="inf-summary-card">
        <strong>${live}</strong>
        <span>live scripts</span>
      </article>
      <article class="inf-summary-card">
        <strong>${total}</strong>
        <span>total scripts</span>
      </article>
      <article class="inf-summary-card">
        <strong>${(platformsConfig.platforms || []).length}</strong>
        <span>platform links</span>
      </article>
      <article class="inf-summary-card">
        <strong>${(devicesConfig.devices || []).length}</strong>
        <span>devices</span>
      </article>
    </div>
  `;
}

function attachFormBehavior(route) {
  const main = appRoot.querySelector('[data-inf-main]');
  const form = main?.querySelector('[data-inf-form]');
  if (!form) return;

  bindAutosave(main, `infinity:${route}`);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = serializeForm(form);
    console.log(`submitted:${route}`, payload);
    alert(`${route} saved locally. Wire email/API routing next.`);
  }, { once: true });
}

function renderRoute(route, queryOverride = '') {
  const cleanRoute = normalizeRoute(route);
  const query = queryOverride || getState().query || layout.searchInput?.value || '';
  let html = '';

  setState({ route: cleanRoute, query });
  layout.setSummary(summaryHtml());

  if (cleanRoute === 'assistance') {
    html = renderCategoriesView(scriptItems, { configuredCategories, query });
  } else if (cleanRoute === 'download') {
    html = renderDownloadPage(scriptItems);
  } else if (cleanRoute === 'search') {
    const visible = searchItems(scriptItems, query, { fields: indexFields });
    html = renderSearchResultsView(visible, query);
  } else if (cleanRoute === 'share') {
    html = renderSharePage(formsConfig.forms?.share || {});
  } else if (cleanRoute === 'upload') {
    html = renderUploadPage(formsConfig.forms?.upload || {});
  } else if (cleanRoute === 'request') {
    html = renderRequestPage(formsConfig.forms?.request || {});
  } else if (cleanRoute === 'review') {
    html = renderReviewPage(formsConfig.forms?.review || {});
  } else if (cleanRoute === 'report') {
    html = renderReportPage(formsConfig.forms?.report || {});
  } else if (cleanRoute === 'sponsor') {
    html = renderSponsorPage();
  } else if (cleanRoute === 'platforms') {
    html = renderPlatformsPage(platformsConfig.platforms || []);
  } else if (cleanRoute === 'devices') {
    html = renderDevicesPage(devicesConfig.devices || []);
  } else if (cleanRoute === 'disclaimer') {
    html = renderDisclaimerPage();
  } else if (cleanRoute === 'terminal') {
    html = renderTerminalPage();
  } else if (cleanRoute === 'iwl') {
    html = renderIwlPage(formsConfig.forms?.iwl || {});
  } else {
    html = renderCategoriesView(scriptItems, { configuredCategories, query });
  }

  layout.setPageContent(html);

  const main = appRoot.querySelector('[data-inf-main]');
  if (main) {
    bindCardActions(main, {
      onExpand: (id, card) => {
        card.classList.toggle('is-expanded');
        console.log('expand', id);
      },
      onAction: (action, id) => {
        console.log(action, id);
        if (action === 'download') {
          const item = scriptItems.find(s => s.id === id);
          if (item?.download_path) {
            const link = document.createElement('a');
            link.href = item.download_path;
            link.download = item.download_path.split('/').pop();
            link.click();
          } else {
            console.warn('No download path for:', id);
          }
        }
        }
      }
    });
  }

  if (['share', 'upload', 'request', 'review', 'report', 'iwl'].includes(cleanRoute)) {
    attachFormBehavior(cleanRoute);
  }

  if (cleanRoute === 'search') {
    searchDock.open();
  } else {
    searchDock.close();
  }
}

layout.searchInput?.addEventListener('input', () => {
  if (normalizeRoute(window.location.hash) === 'search') {
    renderRoute('search', layout.searchInput.value);
  }
});

layout.searchInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    window.location.hash = '#search';
  }
});

onRouteChange(renderRoute);
