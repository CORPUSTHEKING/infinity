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
const categoryDescriptions = {
  terminal: 'Terminal helpers and shell utilities for workflows, recovery, and everyday command-line work.',
  downloads: 'Immediate script bundles and helper flows ready for local or Git-backed delivery.',
  helpers: 'Utility scripts that speed up repo checks, setup, and common maintenance tasks.'
};

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

function uniqueCategories() {
  const fromConfig = Array.isArray(scriptsConfig.categories) ? scriptsConfig.categories : [];
  const fromItems = scriptItems.map((item) => item.category).filter(Boolean);
  return Array.from(new Set([...fromConfig, ...fromItems]));
}

function groupScriptsByCategory() {
  const groups = new Map();
  for (const category of uniqueCategories()) {
    groups.set(category, []);
  }
  for (const item of scriptItems) {
    const key = item.category || 'uncategorized';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()].map(([category, items]) => ({ category, items }));
}

function renderCategorySection(category, items, query = '') {
  const title = String(category || 'uncategorized');
  const label = title.toUpperCase();
  const desc = categoryDescriptions[title] || 'Scripts in this category are kept data-driven, so new items can be added by editing config only.';
  const countLabel = `${items.length} script${items.length === 1 ? '' : 's'} loaded`;

  return `
    <section class="inf-category">
      <div class="inf-category-head">
        <h2>${label}</h2>
        <span>${countLabel}</span>
      </div>
      <p class="inf-category-desc">${desc}${query ? ` • filtered by “${query}”` : ''}</p>
      <div class="inf-cards-rail">
        ${renderScriptCards(items)}
      </div>
    </section>
  `;
}

function renderHome(query = '') {
  const groups = groupScriptsByCategory();
  return `
    <section class="inf-categories">
      ${groups.map((group) => renderCategorySection(group.category, group.items, query)).join('')}
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
  const query = layout.searchInput?.value || '';
  let html = '';

  if (cleanRoute === 'assistance') html = renderHome();
  else if (cleanRoute === 'download') html = renderHome();
  else if (cleanRoute === 'search') {
    const visible = searchItems(scriptItems, query, { fields: indexFields });
    html = `
      <section class="inf-category">
        <div class="inf-category-head">
          <h2>SEARCH RESULTS</h2>
          <span>${visible.length} result${visible.length === 1 ? '' : 's'}</span>
        </div>
        <p class="inf-category-desc">Search matches across names, authors, shells, languages, descriptions, dependencies, and install notes.</p>
        <div class="inf-cards-rail">
          ${renderScriptCards(visible)}
        </div>
      </section>
    `;
  } else if (cleanRoute === 'share') html = renderSharePage(formsConfig.forms?.share || {});
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

  layout.setSummary(summaryHtml());
  layout.setPageContent(html);

  const main = appRoot.querySelector('[data-inf-main]');
  if (!main) return;

  if (cleanRoute === 'assistance' || cleanRoute === 'download') {
    main.innerHTML = renderHome(query);
  }

  if (cleanRoute === 'search') {
    main.innerHTML = html;
  }

  const railCards = main.querySelectorAll('[data-script-card]');
  if (railCards.length) {
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

layout.searchInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    window.location.hash = '#search';
  }
});

onRouteChange(renderRoute);
