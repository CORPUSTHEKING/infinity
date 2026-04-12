import { renderForm } from '../components/forms.js';

export function renderReportPage(schema = {}) {
  return `
    <section class="inf-page">
      <h2>${schema.title || 'Report'}</h2>
      ${renderForm(schema, {}, { formId: schema.formId || '' })}
    </section>
  `;
}
