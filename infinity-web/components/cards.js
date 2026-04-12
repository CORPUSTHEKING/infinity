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
