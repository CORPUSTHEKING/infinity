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
