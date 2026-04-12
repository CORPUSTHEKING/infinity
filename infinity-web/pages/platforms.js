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
