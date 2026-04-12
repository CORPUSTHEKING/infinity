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
