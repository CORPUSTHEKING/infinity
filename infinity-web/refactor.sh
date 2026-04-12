mkdir -p components/utils

cat <<'EOF' > components/utils/html.js
export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return ch;
    }
  });
}
EOF

cat <<'EOF' > components/hero.js
import { escapeHTML } from './utils/html.js';
import { renderHeroOverlay } from './hero/overlay/text.js';

export function renderHero(input = {}) {
  const config = typeof input === 'string' ? { siteName: input } : (input || {});

  const siteName =
    config.site_name ||
    config.siteName ||
    config.title ||
    'Infinity Terminal Helpers';

  const showOverlay = config.showOverlay !== false;
  const overlayContent =
    config.content ??
    config.hero_content ??
    siteName;

  const overlaySubtext =
    config.subtext ??
    config.hero_subtext ??
    '';

  return `
    <div class="inf-hero-panoramic">
      ${showOverlay ? renderHeroOverlay(escapeHTML(overlayContent), escapeHTML(overlaySubtext)) : ''}
    </div>
  `;
}
EOF

cat <<'EOF' > components/drawer.js
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
EOF

cat <<'EOF' > components/quickrail.js
import { escapeHTML } from './utils/html.js';

const DEFAULT_ACTIONS = [
  { key: 'download', label: 'scripts' },
  { key: 'share', label: 'share' },
  { key: 'request', label: 'request' },
  { key: 'disclaimer', label: 'configs' }
];

export function renderQuickRail(config = {}) {
  const actions = Array.isArray(config.quick_actions) && config.quick_actions.length
    ? config.quick_actions
    : DEFAULT_ACTIONS;

  return `
    <nav class="inf-quickrail" data-inf-quickrail aria-label="Quick actions">
      <div class="inf-quickrail-scroll">
        ${actions
          .map((item) => {
            const key = escapeHTML(item.key || '');
            const label = escapeHTML(item.label || item.key || '');
            return `<a href="#${key}" data-route="${key}">${label}</a>`;
          })
          .join('')}
      </div>
    </nav>
  `;
}

export function bindQuickRail({ rail, shell, onOpen, onClose } = {}) {
  if (!rail) {
    return {
      open() {},
      close() {},
      toggle() {},
      isOpen() {
        return false;
      }
    };
  }

  const open = () => {
    rail.classList.remove('is-hidden');
    rail.classList.remove('is-faded');
    shell?.classList.remove('rail-hidden');
    onOpen?.();
  };

  const close = () => {
    rail.classList.add('is-hidden');
    shell?.classList.add('rail-hidden');
    onClose?.();
  };

  const toggle = () => {
    if (rail.classList.contains('is-hidden')) open();
    else close();
  };

  const updateFade = () => {
    const scrolled = (window.scrollY || 0) > 18;
    rail.classList.toggle('is-faded', scrolled && !rail.classList.contains('is-hidden'));
  };

  document.addEventListener(
    'pointerdown',
    (event) => {
      if (rail.contains(event.target)) return;
      close();
    },
    { capture: true }
  );

  window.addEventListener('scroll', updateFade, { passive: true });
  updateFade();
  open();

  return {
    open,
    close,
    toggle,
    isOpen() {
      return !rail.classList.contains('is-hidden');
    }
  };
}
EOF

cat <<'EOF' > components/cards.js
import { Icons } from './icons.js';
import { escapeHTML } from './utils/html.js';

function listMetaValues(item = {}) {
  return [item.shell, item.language, item.category, item.version]
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== '')
    .map((value) => escapeHTML(value));
}

function renderDependencies(value) {
  if (Array.isArray(value)) {
    return escapeHTML(value.join('\n'));
  }

  if (value === undefined || value === null || String(value).trim() === '') {
    return 'No dependencies listed.';
  }

  return escapeHTML(value);
}

export function renderScriptCards(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return '<div class="inf-result">No scripts loaded yet.</div>';
  }

  return items
    .map((item) => {
      const id = escapeHTML(item.id || '');
      const author = escapeHTML(item.author || item.owner || 'Unknown author');
      const title = escapeHTML(item.name || item.title || 'Untitled script');
      const description = escapeHTML(item.description || item.summary || 'No description provided.');
      const meta = listMetaValues(item);
      const dependencies = renderDependencies(item.dependencies);

      return `
        <article class="inf-card" data-script-card data-script-id="${id}">
          <header class="inf-card-head">
            <div class="inf-card-author">${author}</div>
            <h3 class="inf-card-title">${title}</h3>
          </header>

          <button type="button" class="inf-card-body" data-script-expand aria-expanded="false">
            <p>${description}</p>
          </button>

          <footer class="inf-card-foot">
            <div class="inf-card-meta">
              ${meta.map((value) => `<span>${value}</span>`).join('')}
            </div>

            <div class="inf-card-actions">
              <button type="button" data-action="download" title="Download" aria-label="Download">${Icons.download}</button>
              <button type="button" data-action="share" title="Share" aria-label="Share">${Icons.share}</button>
              <button type="button" data-action="request" title="Request" aria-label="Request">${Icons.request}</button>
              <button type="button" data-action="report" title="Report" aria-label="Report">${Icons.report}</button>
            </div>

            <pre class="inf-card-deps">${dependencies}</pre>
          </footer>
        </article>
      `;
    })
    .join('');
}
EOF

cat <<'EOF' > components/categories.js
import { renderScriptCards } from './cards.js';
import { escapeHTML } from './utils/html.js';

function normalizeTree(source) {
  if (Array.isArray(source)) return source;
  if (source && Array.isArray(source.categories)) return source.categories;
  if (source && Array.isArray(source.tree)) return source.tree;
  return [];
}

export function renderCategoriesView(tree = [], { query = '' } = {}) {
  const nodes = normalizeTree(tree);
  const safeQuery = String(query || '').trim();

  return `
    <div class="inf-categories">
      ${
        nodes.length
          ? nodes
              .map((node) => {
                if (!node || node.type !== 'directory') return '';

                const files = Array.isArray(node.children)
                  ? node.children.filter((child) => child && child.type === 'file')
                  : [];

                return `
                  <section class="inf-category">
                    <div class="inf-category-head">
                      <h2>${escapeHTML(String(node.name || '').toUpperCase())}</h2>
                      <span class="inf-badge">${files.length} SCRIPTS LOADED</span>
                    </div>
                    <p class="inf-category-desc">
                      above pane describes this script category then the scripts roll -><- horizontally
                    </p>
                    <div class="inf-cards-rail">
                      ${renderScriptCards(files)}
                    </div>
                  </section>
                `;
              })
              .join('')
          : `
            <section class="inf-category">
              <div class="inf-category-head">
                <h2>NO CATEGORIES</h2>
                <span class="inf-badge">0 SCRIPTS LOADED</span>
              </div>
              <p class="inf-category-desc">
                ${safeQuery ? `No category data was found for "${escapeHTML(safeQuery)}".` : 'No category data is available yet.'}
              </p>
            </section>
          `
      }
    </div>
  `;
}

export function renderSearchResultsView(results = [], query = '') {
  const safeQuery = escapeHTML(query);

  return `
    <div class="inf-categories">
      <section class="inf-category">
        <div class="inf-category-head">
          <h2>SEARCH RESULTS</h2>
          <span class="inf-badge">${Array.isArray(results) ? results.length : 0} MATCHES</span>
        </div>
        <p class="inf-category-desc">
          Matching scripts for ${safeQuery ? `"${safeQuery}"` : 'your search query'}.
        </p>
        <div class="inf-cards-rail">
          ${renderScriptCards(results)}
        </div>
      </section>
    </div>
  `;
}
EOF

cat <<'EOF' > components/cardActions.js
export function bindCardActions(root, handlers = {}) {
  if (!root) return () => {};

  const onClick = (event) => {
    const expandButton = event.target.closest('[data-script-expand]');
    const actionButton = event.target.closest('[data-action]');
    const card = event.target.closest('[data-script-card]');

    if (!card) return;
    const itemId = card.getAttribute('data-script-id');

    if (expandButton) {
      const nextExpanded = !card.classList.contains('is-expanded');
      card.classList.toggle('is-expanded', nextExpanded);
      expandButton.setAttribute('aria-expanded', String(nextExpanded));
      handlers.onExpand?.(itemId, card, nextExpanded);
      return;
    }

    if (actionButton) {
      const action = actionButton.getAttribute('data-action');

      actionButton.classList.add('btn-loading');
      window.setTimeout(() => {
        actionButton.classList.remove('btn-loading');
      }, 800);

      handlers.onAction?.(action, itemId, card);
    }
  };

  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}

function encodePathSegments(path = '') {
  return String(path)
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function handleDownload(itemNode, siteConfig) {
  if (!itemNode || !itemNode.path) {
    console.error('[Infinity] Download failed: Invalid item or missing path.');
    return;
  }

  const repoUrl = String(siteConfig?.repoUrl || 'https://github.com/CORPUSTHEKING/infinity').replace(/\/+$/, '');
  const branch = encodeURIComponent(siteConfig?.branch || 'main');
  const itemPath = String(itemNode.path);

  const downloadUrl = new URL(`./assets/payloads/${encodePathSegments(itemPath)}`, document.baseURI).href;

  if (itemNode.type === 'file' || !itemNode.type) {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = itemNode.name || itemNode.path;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`[Infinity] Triggered download: ${downloadUrl}`);
    return;
  }

  if (itemNode.type === 'directory') {
    const githubFolderUrl = `${repoUrl}/tree/${branch}/infinity-web/assets/payloads/${encodePathSegments(itemPath)}`;
    if (confirm(`Directory: "${itemNode.name}"\n\nBrowsers cannot natively download folders. Redirect to GitHub repo?`)) {
      window.open(githubFolderUrl, '_blank', 'noopener');
    }
  }
}
EOF

cat <<'EOF' > components/layout.js
import { renderDrawer } from './drawer.js';
import { renderHero } from './hero.js';
import { renderQuickRail } from './quickrail.js';
import { renderSearchDock } from './searchdock.js';
import { renderSummary } from './summary.js';

export function createLayoutShell(config = {}) {
  const siteName = config.site_name || 'INFINITY';
  const ui = config.ui || {};
  const showBottomBar = ui.show_bottom_bar !== false;
  const showBottomSearch = ui.show_bottom_search !== false;

  return `
    <div class="inf-shell" data-inf-shell>
      <header class="inf-brandbar" data-inf-brandbar>
        <div class="inf-logo-wrapper">
          <span class="inf-symbol">∞</span>
        </div>
        <button type="button" class="inf-menu-btn" data-inf-menu-toggle aria-label="Menu">
          menu
        </button>
      </header>

      ${renderQuickRail(config)}
      ${renderDrawer(config)}

      <section class="inf-hero" data-inf-hero>
        ${renderHero(config)}
      </section>

      <section class="inf-summary" data-inf-summary style="display: none;">
        ${renderSummary(config.summary || {})}
      </section>

      <main class="inf-main" data-inf-main></main>

      ${showBottomSearch ? renderSearchDock() : ''}

      ${showBottomBar ? `
        <footer class="inf-bottombar curved" data-inf-bottombar>
          <div class="inf-bottombar-inner">
            <a href="#assistance">home</a>
            <a href="#upload">upload</a>
            <a href="#download">downloads</a>
          </div>
        </footer>
      ` : ''}
    </div>
  `;
}

export function mountLayout(root, config = {}) {
  root.innerHTML = createLayoutShell(config);

  const shell = root.querySelector('[data-inf-shell]');
  const brandbar = root.querySelector('[data-inf-brandbar]');
  const quickRail = root.querySelector('[data-inf-quickrail]');
  const drawer = root.querySelector('[data-inf-drawer]');
  const searchDock = root.querySelector('[data-inf-searchdock]');
  const searchPanel = root.querySelector('[data-inf-searchpanel]');
  const searchInput = root.querySelector('[data-inf-search-input]');
  const main = root.querySelector('[data-inf-main]');

  return {
    root,
    shell,
    brandbar,
    quickRail,
    drawer,
    searchDock,
    searchPanel,
    searchInput,
    main,
    setHero(html) {
      const hero = root.querySelector('[data-inf-hero]');
      if (hero) hero.innerHTML = html;
    },
    setSummary(html) {
      const summary = root.querySelector('[data-inf-summary]');
      if (summary) summary.innerHTML = html;
    },
    setPageContent(html) {
      const target = main || root.querySelector('[data-inf-main]');
      if (target) target.innerHTML = html;
    },
    setDrawerVisible(visible) {
      if (drawer) {
        drawer.hidden = !visible;
        drawer.classList.toggle('is-open', Boolean(visible));
      }
    },
    setSearchValue(value = '') {
      if (searchInput) searchInput.value = value;
    },
    openSearch() {
      const dock = searchDock || root.querySelector('[data-inf-searchdock]');
      const panel = searchPanel || root.querySelector('[data-inf-searchpanel]');
      if (dock) dock.classList.add('is-open');
      if (panel) panel.hidden = false;
      searchInput?.focus({ preventScroll: true });
    },
    closeSearch() {
      const dock = searchDock || root.querySelector('[data-inf-searchdock]');
      const panel = searchPanel || root.querySelector('[data-inf-searchpanel]');
      if (dock) dock.classList.remove('is-open');
      if (panel) panel.hidden = true;
    }
  };
}
EOF

cat <<'EOF' > assets/js/data.js
let cachedManifest = null;
let manifestPromise = null;

export function manifestTree(manifest) {
  if (Array.isArray(manifest)) return manifest;
  if (manifest && Array.isArray(manifest.categories)) return manifest.categories;
  if (manifest && Array.isArray(manifest.tree)) return manifest.tree;
  return [];
}

async function fetchJson(path) {
  const res = await fetch(path, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

export async function getManifest() {
  if (cachedManifest) return cachedManifest;
  if (manifestPromise) return manifestPromise;

  manifestPromise = (async () => {
    const sources = [
      './assets/payloads/manifest.json',
      './config/scripts.json'
    ];

    for (const source of sources) {
      try {
        const json = await fetchJson(source);
        cachedManifest = json;
        return json;
      } catch (error) {
        continue;
      }
    }

    cachedManifest = [];
    return [];
  })();

  return manifestPromise;
}

function nodeSearchText(node = {}, fields = []) {
  const fallbackFields = fields.length
    ? fields
    : ['name', 'title', 'path', 'description', 'author', 'owner', 'version', 'shell', 'language', 'category', 'id'];

  return fallbackFields
    .map((field) => {
      const value = node?.[field];
      if (Array.isArray(value)) return value.join(' ');
      if (value && typeof value === 'object') return Object.values(value).join(' ');
      return value ?? '';
    })
    .join(' ')
    .toLowerCase();
}

export async function searchScripts(query) {
  const manifest = await getManifest();
  const q = String(query || '').trim().toLowerCase();

  if (!q) return [];

  const results = [];
  const stack = [...manifestTree(manifest)];

  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;

    if (node.type === 'file') {
      const haystack = nodeSearchText(node, Array.isArray(manifest?.index_fields) ? manifest.index_fields : []);
      if (haystack.includes(q)) {
        results.push(node);
      }
    }

    if (Array.isArray(node.children) && node.children.length) {
      stack.push(...node.children);
    }
  }

  return results.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
}
EOF

cat <<'EOF' > components/router/download.js
import { getManifest, manifestTree } from '../../assets/js/data.js';
import { renderCategoriesView } from '../categories.js';
import { bindCardActions, handleDownload } from '../cardActions.js';

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
      ui.setPageContent(renderCategoriesView(tree));

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

cat <<'EOF' > components/router/docs.js
import { escapeHTML } from '../utils/html.js';

export async function handleDocsPageRoute(ui, urlParams) {
  const docId = String(urlParams.get('id') || '').trim();

  if (!docId) {
    ui.setPageContent(`
      <div class="inf-page">
        <h2>Documentation Error</h2>
        <p>No document ID specified.</p>
        <a href="#home" class="inf-btn-primary">Return Home</a>
      </div>
    `);
    return;
  }

  ui.setPageContent('<div class="inf-page"><p class="inf-loading">Loading documentation...</p></div>');

  try {
    const response = await fetch(`./assets/docs/${encodeURIComponent(docId)}.md`, {
      cache: 'force-cache'
    });

    if (!response.ok) throw new Error('Document not found');

    const rawMarkdown = await response.text();
    const htmlContent = window.marked?.parse
      ? window.marked.parse(rawMarkdown)
      : `<pre>${escapeHTML(rawMarkdown)}</pre>`;

    ui.setPageContent(`
      <div class="inf-page inf-doc-viewer">
        <div class="inf-doc-header">
          <a href="#home" style="color: var(--primary); text-decoration: none; font-size: 0.8rem;">← BACK</a>
        </div>
        <article class="markdown-body">
          ${htmlContent}
        </article>
      </div>
    `);
  } catch (error) {
    ui.setPageContent(`
      <div class="inf-page">
        <h2>404</h2>
        <p>Documentation for "${escapeHTML(docId)}" could not be found.</p>
        <a href="#home" class="inf-btn-primary">Back to Home</a>
      </div>
    `);
  }
}
EOF

cat <<'EOF' > components/router.js
import { renderCategoriesView, renderSearchResultsView } from './categories.js';
import { getManifest, searchScripts } from '../assets/js/data.js';
import { handleDownloadPageRoute } from './router/download.js';
import { handleDocsPageRoute } from './router/docs.js';
import { dynamicRoutes } from './router/scan.js';

export function initRouter(ui, config) {
  const scope = ui.root || document;

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

    switch (hash) {
      case 'docs':
        await handleDocsPageRoute(ui, urlParams);
        break;

      case 'assistance':
      case 'home':
        ui.setPageContent(`
          <div class="inf-page">
            <h2>Welcome to Infinity</h2>
            <p>Your centralized hub for terminal utilities, payload scripts, and workspace configurations.</p>
            <p>Use the navigation below to browse downloads, or tap the search icon to find specific tools.</p>
          </div>
        `);
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
        ui.setPageContent(renderSearchResultsView(results, query));
        break;
      }

      case 'upload':
      case 'request': {
        const isUpload = hash === 'upload';
        const titleText = isUpload ? 'Upload a Script' : 'Request a Script';
        const labelText = isUpload ? 'Script Content or Link' : 'Describe the tool you need';
        const ghLabel = isUpload ? 'submission' : 'enhancement';

        ui.setPageContent(`
          <div class="inf-page">
            <h2>${titleText.toUpperCase()}</h2>
            <p class="inf-category-desc">
              Infinity is a decentralized static platform. Submissions are securely routed through GitHub Issues.
            </p>
            <form class="inf-form" onsubmit="
              event.preventDefault();
              const title = encodeURIComponent((document.getElementById('inf-f-title').value || '').trim());
              const body = encodeURIComponent((document.getElementById('inf-f-body').value || '').trim());
              const url = 'https://github.com/CORPUSTHEKING/infinity/issues/new?title=' + title + '&body=' + body + '&labels=${ghLabel}';
              window.open(url, '_blank', 'noopener');
            ">
              <div class="inf-form-group">
                <input type="text" id="inf-f-title" placeholder="${isUpload ? 'e.g., Network Scanner Script' : 'e.g., Need a script to automate backups'}" required />
              </div>
              <div class="inf-form-group">
                <textarea id="inf-f-body" placeholder="${labelText}" rows="6" required></textarea>
              </div>
              <button type="submit" class="inf-btn-primary">Submit via GitHub</button>
            </form>
          </div>
        `);
        break;
      }

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

async function loadConfig() {
  try {
    const res = await fetch('./config/site.json', { cache: 'force-cache' });
    if (!res.ok) throw new Error('config load failed');
    return await res.json();
  } catch (err) {
    console.warn('Could not load site.json, falling back to defaults.', err);
    return {};
  }
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

cat <<'EOF' > index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#070b12">
  <title>Infinity | Terminal Helpers</title>

  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preload" as="image" href="assets/img/huge-panorama.png">
  <link rel="stylesheet" href="assets/css/main.css">
  <link rel="stylesheet" href="assets/css/panoramic.css">

  <script defer src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body style="background: #070b12; margin: 0; overflow-x: hidden;">

  <div class="inf-panorama" style="margin-top: 5rem;"></div>

  <header style="position: absolute; top: 0; left: 0; right: 0; padding: 1.5rem; display: flex; justify-content: flex-end; z-index: 100; pointer-events: none;">
    <button class="inf-btn-icon" aria-label="Open Menu" data-inf-menu-toggle style="background: none; border: none; color: #7c3aed; cursor: pointer; pointer-events: auto;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  </header>

  <div id="app"></div>

  <script defer src="assets/vendor/lucide.min.js"></script>
  <script type="module" src="assets/js/app.js"></script>
  <script type="module" src="components/docs/injector.js"></script>

</body>
</html>
EOF
