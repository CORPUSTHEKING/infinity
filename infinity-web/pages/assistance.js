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
