import { renderScriptCards } from './cards.js';

function uniqueCategories(scriptItems = [], configuredCategories = []) {
  const fromItems = scriptItems.map((item) => item?.category).filter(Boolean);
  return Array.from(new Set([...configuredCategories, ...fromItems]));
}

export function groupScriptsByCategory(scriptItems = [], configuredCategories = []) {
  const groups = new Map();

  for (const category of uniqueCategories(scriptItems, configuredCategories)) {
    groups.set(category, []);
  }

  for (const item of scriptItems) {
    const key = item?.category || 'uncategorized';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  return [...groups.entries()].map(([category, items]) => ({ category, items }));
}

export function renderCategorySection(category, items = [], query = '') {
  const title = String(category || 'uncategorized');
  const label = title.toUpperCase();
  const desc = 'Scripts in this category are kept data-driven, so new items can be added by editing config only.';
  const countLabel = `${items.length} script${items.length === 1 ? '' : 's'} loaded`;

  return `
    <section class="inf-category">
      <div class="inf-category-head">
        <h2>${label}</h2>
        <span>${countLabel}</span>
      </div>
      <p class="inf-category-desc">${desc}${query ? ` • filtered by “${query}”` : ''}</p>
      <div class="inf-cards-rail">
        ${items.length ? renderScriptCards(items) : '<div class="inf-result">No scripts loaded yet.</div>'}
      </div>
    </section>
  `;
}

export function renderCategoriesView(scriptItems = [], { configuredCategories = [], query = '' } = {}) {
  const groups = groupScriptsByCategory(scriptItems, configuredCategories);
  return `
    <section class="inf-categories">
      ${groups.map((group) => renderCategorySection(group.category, group.items, query)).join('')}
    </section>
  `;
}

export function renderSearchResultsView(results = [], query = '') {
  return `
    <section class="inf-category">
      <div class="inf-category-head">
        <h2>SEARCH RESULTS</h2>
        <span>${results.length} result${results.length === 1 ? '' : 's'}</span>
      </div>
      <p class="inf-category-desc">Search matches across names, authors, shells, languages, descriptions, dependencies, and install notes.</p>
      <div class="inf-cards-rail">
        ${results.length ? renderScriptCards(results) : '<div class="inf-result">No matching scripts.</div>'}
      </div>
    </section>
  `;
}
