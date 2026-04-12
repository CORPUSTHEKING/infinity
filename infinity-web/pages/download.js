import { renderCategoriesView } from '../components/categories.js';

export function renderDownloadPage(tree = []) {
  return `
    <section class="inf-page">
      <h2>Downloads</h2>
      <p>Immediate download actions for scripts and sections.</p>
      ${renderCategoriesView(tree)}
    </section>
  `;
}
