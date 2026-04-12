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
