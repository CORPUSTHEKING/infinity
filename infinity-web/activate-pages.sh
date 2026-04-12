mkdir -p components/utils

cat <<'EOF' > components/utils/html.js
export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return ch;
    }
  });
}
EOF

cat <<'EOF' > components/forms.js
import { escapeHTML } from './utils/html.js';

function fieldLabel(field) {
  return field?.label || field?.title || field?.name || 'Field';
}

function fieldId(field) {
  return field?.id || field?.name || `field-${Math.random().toString(36).slice(2, 8)}`;
}

function fieldOptions(field = {}) {
  const raw = field.options || field.choices || [];
  return Array.isArray(raw) ? raw : [];
}

export function renderForm(schema = {}, values = {}, options = {}) {
  const fields = Array.isArray(schema.fields) ? schema.fields : [];
  const formId = options.formId || schema.formId || schema.id || '';

  return `
    <form class="inf-form" data-inf-form ${formId ? `id="${escapeHTML(formId)}"` : ''}>
      <header class="inf-form-head">
        <h2>${escapeHTML(schema.title || 'Form')}</h2>
      </header>

      <div class="inf-form-grid">
        ${fields.map((field) => {
          const name = String(field.name || '');
          const id = escapeHTML(fieldId(field));
          const label = escapeHTML(fieldLabel(field));
          const value = values[field.name] ?? '';
          const required = field.required ? 'required' : '';
          const placeholder = field.placeholder ? `placeholder="${escapeHTML(field.placeholder)}"` : '';

          if (field.type === 'textarea') {
            return `
              <label class="inf-field" for="${id}">
                <span>${label}</span>
                <textarea
                  id="${id}"
                  name="${escapeHTML(name)}"
                  ${placeholder}
                  ${required}
                >${escapeHTML(String(value))}</textarea>
              </label>
            `;
          }

          if (field.type === 'select') {
            const optionsList = fieldOptions(field);
            return `
              <label class="inf-field" for="${id}">
                <span>${label}</span>
                <select id="${id}" name="${escapeHTML(name)}" ${required}>
                  <option value="">Select ${label}</option>
                  ${optionsList.map((option) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? (option.label || option.value) : option;
                    const selected = String(value) === String(optionValue) ? 'selected' : '';
                    return `<option value="${escapeHTML(String(optionValue))}" ${selected}>${escapeHTML(String(optionLabel))}</option>`;
                  }).join('')}
                </select>
              </label>
            `;
          }

          if (field.type === 'radio') {
            const optionsList = fieldOptions(field);
            return `
              <fieldset class="inf-field">
                <span>${label}</span>
                <div class="inf-radio-group">
                  ${optionsList.map((option) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? (option.label || option.value) : option;
                    const checked = String(value) === String(optionValue) ? 'checked' : '';
                    return `
                      <label class="inf-field-inline">
                        <input
                          type="radio"
                          name="${escapeHTML(name)}"
                          value="${escapeHTML(String(optionValue))}"
                          ${checked}
                          ${required}
                        />
                        <span>${escapeHTML(String(optionLabel))}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </fieldset>
            `;
          }

          if (field.type === 'checkbox') {
            return `
              <label class="inf-field inf-field-inline" for="${id}">
                <input
                  id="${id}"
                  type="checkbox"
                  name="${escapeHTML(name)}"
                  ${value ? 'checked' : ''}
                />
                <span>${label}</span>
              </label>
            `;
          }

          return `
            <label class="inf-field" for="${id}">
              <span>${label}</span>
              <input
                id="${id}"
                type="${escapeHTML(field.type || 'text')}"
                name="${escapeHTML(name)}"
                value="${escapeHTML(String(value))}"
                ${placeholder}
                ${required}
              />
            </label>
          `;
        }).join('')}
      </div>

      <footer class="inf-form-actions">
        <button type="submit">Send</button>
      </footer>
    </form>
  `;
}

export function bindAutosave(formRoot, storageKey) {
  if (!storageKey) return () => {};
  const form = formRoot.querySelector('[data-inf-form]');
  if (!form) return () => {};

  const load = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);

      Object.entries(data).forEach(([name, value]) => {
        const inputs = form.querySelectorAll(`[name="${CSS.escape(name)}"]`);
        if (!inputs.length) return;

        inputs.forEach((input) => {
          if (input.type === 'checkbox') input.checked = Boolean(value);
          else if (input.type === 'radio') input.checked = String(input.value) === String(value);
          else input.value = value;
        });
      });
    } catch {}
  };

  const save = () => {
    const data = {};
    form.querySelectorAll('input, textarea, select').forEach((input) => {
      if (!input.name) return;
      if (input.type === 'radio' && !input.checked) return;
      data[input.name] = input.type === 'checkbox' ? input.checked : input.value;
    });
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  load();
  form.addEventListener('input', save);
  form.addEventListener('change', save);

  return () => {
    form.removeEventListener('input', save);
    form.removeEventListener('change', save);
  };
}

export function serializeForm(form) {
  const data = {};
  const fd = new FormData(form);

  for (const [key, value] of fd.entries()) {
    if (data[key] !== undefined) {
      if (!Array.isArray(data[key])) data[key] = [data[key]];
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }

  form.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    if (input.name && !fd.has(input.name)) data[input.name] = false;
  });

  return data;
}
EOF

cat <<'EOF' > pages/assistance.js
import { escapeHTML } from '../components/utils/html.js';

export function renderAssistancePage(config = {}) {
  const siteName = escapeHTML(config.site_name || 'Infinity');

  return `
    <section class="inf-page">
      <h2>${siteName} Assistance</h2>
      <p>This section carries terminal help, questions, and guidance for using scripts safely.</p>
    </section>
  `;
}
EOF

cat <<'EOF' > pages/download.js
import { renderCategoriesView } from '../components/categories.js';

export function renderDownloadPage(tree = []) {
  return `
    <section class="inf-page">
      <h2>Downloads</h2>
      <p>Immediate download actions for scripts and sections.</p>
      ${renderCategoriesView(tree)}
    </section>
  `;
}
EOF

cat <<'EOF' > pages/search.js
import { escapeHTML } from '../components/utils/html.js';

export function renderSearchPage(results = [], query = '') {
  const safeQuery = escapeHTML(query);

  return `
    <section class="inf-page">
      <h2>Search</h2>
      <p>Search query: ${safeQuery || 'none'}</p>
      <div class="inf-results">
        ${Array.isArray(results) && results.length
          ? results.map((item) => `
              <article class="inf-result">
                <strong>${escapeHTML(item.name || item.title || 'Untitled')}</strong>
                <span>${escapeHTML(item.author || '')}</span>
                <p>${escapeHTML(item.description || '')}</p>
              </article>
            `).join('')
          : '<div class="inf-result">No matches found.</div>'}
      </div>
    </section>
  `;
}
EOF

cat <<'EOF' > pages/share.js
import { renderForm } from '../components/forms.js';

export function renderSharePage(schema = {}) {
  return `
    <section class="inf-page">
      <h2>${schema.title || 'Share a Script'}</h2>
      ${renderForm(schema, {}, { formId: schema.formId || '' })}
    </section>
  `;
}
EOF

cat <<'EOF' > pages/request.js
import { renderForm } from '../components/forms.js';

export function renderRequestPage(schema = {}) {
  return `
    <section class="inf-page">
      <h2>${schema.title || 'Request'}</h2>
      ${renderForm(schema, {}, { formId: schema.formId || '' })}
    </section>
  `;
}
EOF

cat <<'EOF' > pages/review.js
import { renderForm } from '../components/forms.js';

export function renderReviewPage(schema = {}) {
  return `
    <section class="inf-page">
      <h2>${schema.title || 'Review'}</h2>
      ${renderForm(schema, {}, { formId: schema.formId || '' })}
    </section>
  `;
}
EOF

cat <<'EOF' > pages/report.js
import { renderForm } from '../components/forms.js';

export function renderReportPage(schema = {}) {
  return `
    <section class="inf-page">
      <h2>${schema.title || 'Report'}</h2>
      ${renderForm(schema, {}, { formId: schema.formId || '' })}
    </section>
  `;
}
EOF

cat <<'EOF' > pages/sponsor.js
import { escapeHTML } from '../components/utils/html.js';

export function renderSponsorPage(config = {}) {
  const siteName = escapeHTML(config.site_name || 'Infinity');

  return `
    <section class="inf-page">
      <h2>Sponsor</h2>
      <p>The sponsor button stays visible and accessible across ${siteName}.</p>
    </section>
  `;
}
EOF

cat <<'EOF' > pages/platforms.js
import { escapeHTML } from '../components/utils/html.js';

function normalizePlatforms(input = []) {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray(input.platforms)) return input.platforms;
  return [];
}

export function renderPlatformsPage(platforms = []) {
  const items = normalizePlatforms(platforms);

  return `
    <section class="inf-page">
      <h2>Platforms</h2>
      <div class="inf-grid">
        ${items.length
          ? items.map((platform) => `
              <article class="inf-tile">
                <strong>${escapeHTML(platform.name || platform.label || '')}</strong>
                <p>${escapeHTML(platform.url || platform.link || '')}</p>
              </article>
            `).join('')
          : '<div class="inf-tile">No platform entries available.</div>'}
      </div>
    </section>
  `;
}
EOF

cat <<'EOF' > pages/devices.js
import { escapeHTML } from '../components/utils/html.js';

function normalizeDevices(input = []) {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray(input.devices)) return input.devices;
  return [];
}

export function renderDevicesPage(devices = []) {
  const items = normalizeDevices(devices);

  return `
    <section class="inf-page">
      <h2>Devices</h2>
      <div class="inf-grid">
        ${items.length
          ? items.map((device) => `
              <article class="inf-tile">
                <strong>${escapeHTML(device.name || device.label || '')}</strong>
                <p>${escapeHTML(device.note || device.description || '')}</p>
              </article>
            `).join('')
          : '<div class="inf-tile">No device entries available.</div>'}
      </div>
    </section>
  `;
}
EOF

cat <<'EOF' > pages/disclaimer.js
import { escapeHTML } from '../components/utils/html.js';

export function renderDisclaimerPage(config = {}) {
  const siteName = escapeHTML(config.site_name || 'Infinity');

  return `
    <section class="inf-page">
      <h2>Disclaimer</h2>
      <p>${siteName} scripts may change your device or files. Read each script description and installation note before use.</p>
    </section>
  `;
}
EOF

cat <<'EOF' > pages/terminal.js
import { escapeHTML } from '../components/utils/html.js';

export function renderTerminalPage(config = {}) {
  const siteName = escapeHTML(config.site_name || 'Infinity');

  return `
    <section class="inf-page">
      <h2>Terminal Helpers</h2>
      <p>This section belongs to ${siteName} and the terminal helper branch.</p>
    </section>
  `;
}
EOF

cat <<'EOF' > pages/iwl.js
import { renderForm } from '../components/forms.js';

export function renderIwlPage(schema = {}) {
  return `
    <section class="inf-page">
      <h2>${schema.title || 'I Would Like'}</h2>
      ${renderForm(schema, {}, { formId: schema.formId || '' })}
    </section>
  `;
}
EOF

cat <<'EOF' > pages/upload.js
import { renderForm } from '../components/forms.js';

function defaultUploadSchema() {
  return {
    formId: 'upload-form',
    title: 'Infinity Submission Portal',
    fields: [
      { id: 'up-id', name: 'id', label: 'Script / Engine ID', type: 'text', placeholder: 'e.g., custom-engine-01', required: true },
      { id: 'up-author', name: 'author', label: 'Author', type: 'text', placeholder: 'Your handle' },
      { id: 'up-category', name: 'category', label: 'Target Category', type: 'select', options: ['Engines', 'Tools', 'Plugins', 'Other'] },
      { id: 'up-desc', name: 'desc', label: 'Description', type: 'textarea', placeholder: 'What does this do?' },
      { id: 'up-code', name: 'code', label: 'Source Code / Content', type: 'textarea', placeholder: 'Paste code here...', required: true }
    ]
  };
}

function mergeSchema(schema = {}) {
  const fallback = defaultUploadSchema();
  const merged = { ...fallback, ...schema };

  merged.formId = schema.formId || fallback.formId;
  merged.title = schema.title || fallback.title;
  merged.fields = Array.isArray(schema.fields) && schema.fields.length ? schema.fields : fallback.fields;

  return merged;
}

export function renderUploadPage(schema = {}) {
  const finalSchema = mergeSchema(schema);

  return `
    <section class="inf-page container my-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card bg-dark text-white border-primary shadow-lg">
            <div class="card-header border-primary bg-transparent py-3">
              <h2 class="h4 mb-0 text-primary">
                <i class="fas fa-cloud-upload-alt me-2"></i>${finalSchema.title}
              </h2>
            </div>
            <div class="card-body">
              ${renderForm(finalSchema, {}, { formId: finalSchema.formId })}
            </div>
            <div class="card-footer border-top border-secondary small text-muted text-center">
              Logged-in users contribute via GitHub Issues. Guests contribute via secure email relay.
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function bindUploadEvents(siteConfig = {}) {
  const form = document.getElementById('upload-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const getValue = (id) => document.getElementById(id)?.value?.trim() || '';

    const formData = {
      id: getValue('up-id'),
      author: getValue('up-author') || 'Anonymous',
      category: getValue('up-category') || 'General',
      desc: getValue('up-desc') || 'No description provided.',
      code: getValue('up-code')
    };

    const payloadText = `### 🚀 New Script Submission: ${formData.id}

**Author:** ${formData.author}
**Category:** ${formData.category}
**Description:** ${formData.desc}

**Code:**
\`\`\`bash
${formData.code}
\`\`\`

-- *Submitted via Infinity Web Engine Interface*`;

    const isAuthenticated = Boolean(localStorage.getItem('infinity_token')) || Boolean(siteConfig.isLoggedIn);

    if (isAuthenticated) {
      const repo = siteConfig.repoUrl || 'https://github.com/CORPUSTHEKING/infinity';
      const issueUrl = `${repo}/issues/new?title=${encodeURIComponent('New Script: ' + formData.id)}&labels=community-submission&body=${encodeURIComponent(payloadText)}`;
      window.open(issueUrl, '_blank', 'noopener');
    } else {
      const recipients = 'corpustheking@gmail.com,mikewebah@gmail.com';
      const subject = `Infinity Script Submission: ${formData.id}`;
      const mailtoUrl = `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(payloadText)}`;
      window.location.href = mailtoUrl;
    }

    form.reset();
  });
}
EOF

cat <<'EOF' > components/router/download.js
import { getManifest, manifestTree } from '../../assets/js/data.js';
import { bindCardActions, handleDownload } from '../cardActions.js';
import { renderDownloadPage } from '../../pages/download.js';

function findItemById(data, id) {
  const nodes = Array.isArray(data) ? data : manifestTree(data);

  for (const item of nodes) {
    if (!item) continue;

    if (String(item.id) === String(id)) {
      return item;
    }

    if (Array.isArray(item.children) && item.children.length > 0) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }

  return null;
}

export async function handleDownloadPageRoute(ui, config) {
  ui.setPageContent('<div class="inf-page"><p class="inf-loading">Loading script manifest...</p></div>');

  try {
    const manifestData = await getManifest();
    const tree = manifestTree(manifestData);

    if (tree.length > 0) {
      ui.setPageContent(renderDownloadPage(tree));

      const mainContainer =
        ui.root?.querySelector('[data-inf-main]') ||
        document.querySelector('.inf-main');

      bindCardActions(mainContainer, {
        onAction: (action, itemId) => {
          if (action === 'download') {
            const item = findItemById(tree, itemId);
            if (item) {
              handleDownload(item, config);
            } else {
              console.error(`[Infinity] Could not locate metadata for item ID: ${itemId}`);
            }
          }
        }
      });
    } else {
      ui.setPageContent('<div class="inf-page"><p>No scripts found. Please run the manifest generator.</p></div>');
    }
  } catch (error) {
    console.error('[Infinity] Failed to load download page data:', error);
    ui.setPageContent('<div class="inf-page"><p class="inf-error">Error loading downloads. Check console.</p></div>');
  }
}
EOF

cat <<'EOF' > components/router.js
import { renderAssistancePage } from '../pages/assistance.js';
import { renderDevicesPage } from '../pages/devices.js';
import { renderDisclaimerPage } from '../pages/disclaimer.js';
import { renderIwlPage } from '../pages/iwl.js';
import { renderPlatformsPage } from '../pages/platforms.js';
import { renderReportPage } from '../pages/report.js';
import { renderRequestPage } from '../pages/request.js';
import { renderReviewPage } from '../pages/review.js';
import { renderSearchPage } from '../pages/search.js';
import { renderSharePage } from '../pages/share.js';
import { renderSponsorPage } from '../pages/sponsor.js';
import { renderTerminalPage } from '../pages/terminal.js';
import { renderUploadPage, bindUploadEvents } from '../pages/upload.js';
import { getManifest, searchScripts } from '../assets/js/data.js';
import { handleDownloadPageRoute } from './router/download.js';
import { handleDocsPageRoute } from './router/docs.js';
import { dynamicRoutes } from './router/scan.js';

function resolveFormSchema(config, key) {
  return config?.forms?.[key]
    || config?.forms?.forms?.[key]
    || {};
}

function resolveList(config, key) {
  const value = config?.[key];
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value[key])) return value[key];
  return [];
}

export function initRouter(ui, config) {
  const scope = ui.root || document;
  let uploadCleanup = null;

  async function handleRoute() {
    const rawHash = window.location.hash.replace('#', '') || 'assistance';
    const [hashPath, queryString] = rawHash.split('?');
    const hash = hashPath || 'assistance';
    const urlParams = new URLSearchParams(queryString || '');

    scope.querySelectorAll('.inf-bottombar a, .inf-drawer a').forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href')?.replace('#', '');
      if (href && href.split('?')[0] === hash) {
        link.classList.add('active');
      }
    });

    if (uploadCleanup) {
      uploadCleanup();
      uploadCleanup = null;
    }

    switch (hash) {
      case 'docs':
        await handleDocsPageRoute(ui, urlParams);
        break;

      case 'assistance':
      case 'home':
        ui.setPageContent(renderAssistancePage(config));
        break;

      case 'download':
        await handleDownloadPageRoute(ui, config);
        break;

      case 'search': {
        const query = urlParams.get('q') || '';
        if (!query) {
          ui.setPageContent('<div class="inf-page"><p>Please enter a search term.</p></div>');
          break;
        }

        ui.setPageContent('<div class="inf-page"><p class="inf-loading">Searching...</p></div>');
        const results = await searchScripts(query);
        ui.setPageContent(renderSearchPage(results, query));
        break;
      }

      case 'share':
        ui.setPageContent(renderSharePage(resolveFormSchema(config, 'share')));
        break;

      case 'upload':
        ui.setPageContent(renderUploadPage(resolveFormSchema(config, 'upload')));
        uploadCleanup = bindUploadEvents(config);
        break;

      case 'request':
        ui.setPageContent(renderRequestPage(resolveFormSchema(config, 'request')));
        break;

      case 'review':
        ui.setPageContent(renderReviewPage(resolveFormSchema(config, 'review')));
        break;

      case 'report':
        ui.setPageContent(renderReportPage(resolveFormSchema(config, 'report')));
        break;

      case 'iwl':
        ui.setPageContent(renderIwlPage(resolveFormSchema(config, 'iwl')));
        break;

      case 'platforms':
        ui.setPageContent(renderPlatformsPage(resolveList(config, 'platforms')));
        break;

      case 'devices':
        ui.setPageContent(renderDevicesPage(resolveList(config, 'devices')));
        break;

      case 'disclaimer':
        ui.setPageContent(renderDisclaimerPage(config));
        break;

      case 'terminal':
        ui.setPageContent(renderTerminalPage(config));
        break;

      case 'sponsor':
        ui.setPageContent(renderSponsorPage(config));
        break;

      default:
        if (dynamicRoutes[hash]) {
          try {
            await dynamicRoutes[hash](ui, urlParams, config);
          } catch (err) {
            console.error(`[Router] Failed to load dynamic route: ${hash}`, err);
            ui.setPageContent('<div class="inf-page"><h2>Execution Error</h2></div>');
          }
        } else {
          ui.setPageContent(`
            <div class="inf-page">
              <h2>${String(hash).toUpperCase()}</h2>
              <p>Information regarding ${String(hash)} is currently being updated.</p>
            </div>
          `);
        }
        break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
EOF

cat <<'EOF' > assets/js/app.js
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
EOF
