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

function summaryHtml() {
  const counts = [
    { value: scriptItems.length, label: 'Scripts loaded' },
    { value: (platformsConfig.platforms || []).length, label: 'Platforms' },
    { value: (devicesConfig.devices || []).length, label: 'Devices' },
    { value: Object.keys(formsConfig.forms || {}).length, label: 'Forms' }
  ];

  return `
    <div class="inf-summary-grid">
      ${counts.map((item) => `
        <article class="inf-summary-card">
          <strong>${item.value}</strong>
          <span>${item.label}</span>
        </article>
      `).join('')}
    </div>
  `;
}

function renderHome() {
  const categories = scriptsConfig.categories || [];
  const grouped = categories.length
    ? categories.map((category) => {
        const items = scriptItems.filter((item) => String(item.category || '').toLowerCase() === String(category).toLowerCase());
        return { category, items };
      })
    : [{ category: 'All scripts', items: scriptItems }];

  return `
    <section class="inf-page">
      <h2>Featured categories</h2>
      <div class="inf-grid">
        ${grouped.map((group) => `
          <article class="inf-tile">
            <strong>${group.category}</strong>
            <p>${group.items.length} script${group.items.length === 1 ? '' : 's'}</p>
            <a href="#download">Open</a>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="inf-page">
      <h2>Rolling cards</h2>
      ${renderScriptCards(scriptItems)}
    </section>
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

function renderRoute(route) {
  const cleanRoute = normalizeRoute(route);
  let html = '';

  if (cleanRoute === 'assistance') html = renderHome();
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
  else html = renderHome();

  layout.setPageContent(html);
  layout.setSummary(summaryHtml());

  const main = appRoot.querySelector('[data-inf-main]');
  if (!main) return;

  if (cleanRoute === 'download' || cleanRoute === 'search' || cleanRoute === 'assistance') {
    const visible = cleanRoute === 'search'
      ? searchItems(scriptItems, layout.searchInput?.value || '', { fields: indexFields })
      : scriptItems;

    if (cleanRoute === 'search') {
      main.innerHTML = renderSearchPage(visible, layout.searchInput?.value || '');
    } else if (cleanRoute === 'download') {
      main.innerHTML = renderDownloadPage(visible);
    } else {
      main.innerHTML = renderHome();
    }

    const cardsHost = document.createElement('div');
    cardsHost.innerHTML = renderScriptCards(visible);
    main.appendChild(cardsHost);

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
