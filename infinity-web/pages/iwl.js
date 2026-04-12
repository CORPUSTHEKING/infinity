import { renderForm } from '../components/forms.js';

export function renderIwlPage(schema = {}) {
  return `
    <section class="inf-page">
      <h2>${schema.title || 'I Would Like'}</h2>
      ${renderForm(schema, {}, { formId: schema.formId || '' })}
    </section>
  `;
}
