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
