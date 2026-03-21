import { mountLayout } from '../../components/layout.js';
import { normalizeRoute, onRouteChange } from '../../components/router.js';
import { searchItems } from '../../components/search.js';
import { renderScriptCards, bindCardActions } from '../../components/cards.js';
import { bindAutosave, serializeForm } from '../../components/forms.js';

import { renderAssistancePage } from '../../pages/assistance.js';
import { renderDownloadPage } from '../../pages/download.js';
import { renderSearchPage } from '../../pages/search.js';
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
const indexFields = Array.isArray(scriptsConfig.index_fields) ? scriptsConfig.index_fields : [];

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

function renderRoute(route) {
  const cleanRoute = normalizeRoute(route);
  let html = '';

  if (cleanRoute === 'assistance') html = renderAssistancePage();
  else if (cleanRoute === 'download') html = renderDownloadPage(scriptItems);
  else if (cleanRoute === 'search') html = renderSearchPage(scriptItems, layout.searchInput?.value || '');
  else if (cleanRoute === 'share') html = renderSharePage(formsConfig.forms?.share || {});
  else if (cleanRoute === 'upload') html = renderUploadPage(formsConfig.forms?.upload || {});
  else if (cleanRoute === 'request') html = renderRequestPage(formsConfig.forms?.request || {});
  else if (cleanRoute === 'review') html = renderReviewPage(formsConfig.forms?.review || {});
  else if (cleanRoute === 'report') html = renderReportPage(formsConfig.forms?.report || {});
  else if (cleanRoute === 'sponsor') html = renderSponsorPage();
  else if (cleanRoute === 'platforms') html = renderPlatformsPage(platformsConfig.platforms || []);
  else if (cleanRoute === 'devices') html = renderDevicesPage(devicesConfig.devices || []);
  else if (cleanRoute === 'disclaimer') html = renderDisclaimerPage();
  else if (cleanRoute === 'terminal') html = renderTerminalPage();
  else if (cleanRoute === 'iwl') html = renderIwlPage(formsConfig.forms?.iwl || {});
  else html = renderAssistancePage();

  layout.setPageContent(html);

  const main = appRoot.querySelector('[data-inf-main]');
  if (!main) return;

  if (cleanRoute === 'download' || cleanRoute === 'search') {
    const visible = cleanRoute === 'search'
      ? searchItems(scriptItems, layout.searchInput?.value || '', { fields: indexFields })
      : scriptItems;

    main.insertAdjacentHTML('beforeend', renderScriptCards(visible));
    bindCardActions(main, {
      onExpand: (id, card) => {
        card.classList.toggle('is-expanded');
        console.log('expand', id);
      },
      onAction: (action, id) => {
        console.log(action, id);
        if (action === 'download') {
          alert(`Download action is wired for script ${id || 'item'}.`);
        }
      }
    });
  }

  if (['share', 'upload', 'request', 'review', 'report', 'iwl'].includes(cleanRoute)) {
    attachFormBehavior(cleanRoute);
  }
}

layout.searchInput?.addEventListener('input', () => {
  if (normalizeRoute(window.location.hash) === 'search') {
    renderRoute('search');
  }
});

onRouteChange(renderRoute);
