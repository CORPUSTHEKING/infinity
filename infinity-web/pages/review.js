import { renderForm } from '../components/forms.js';

export function renderReviewPage(schema = {}) {
  return `
    <section class="inf-page">
      <h2>${schema.title || 'Review'}</h2>
      ${renderForm(schema, {}, { formId: schema.formId || '' })}
    </section>
  `;
}
