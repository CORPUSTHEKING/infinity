import { renderForm } from '../components/forms.js';

export function renderRequestPage(schema = {}) {
  return `
    <section class="inf-page">
      <h2>${schema.title || 'Request'}</h2>
      ${renderForm(schema, {}, { formId: schema.formId || '' })}
    </section>
  `;
}
