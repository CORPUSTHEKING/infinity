import { renderForm } from '../components/forms.js';

export function renderSharePage(schema = {}) {
  return `
    <section class="inf-page">
      <h2>${schema.title || 'Share a Script'}</h2>
      ${renderForm(schema, {}, { formId: schema.formId || '' })}
    </section>
  `;
}
