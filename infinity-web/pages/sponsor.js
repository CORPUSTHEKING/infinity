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
