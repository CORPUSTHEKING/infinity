import { renderForm } from '../components/forms.js';

export function renderUploadPage(schema = {}) {
  return `
    <section class="inf-page">
      <h2>Upload</h2>
      ${renderForm(schema, {})}
    </section>
  `;
}
