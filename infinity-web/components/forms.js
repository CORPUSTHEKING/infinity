import { escapeHTML } from './utils/html.js';

function fieldLabel(field) {
  return field?.label || field?.title || field?.name || 'Field';
}

function fieldId(field) {
  return field?.id || field?.name || `field-${Math.random().toString(36).slice(2, 8)}`;
}

function fieldOptions(field = {}) {
  const raw = field.options || field.choices || [];
  return Array.isArray(raw) ? raw : [];
}

export function renderForm(schema = {}, values = {}, options = {}) {
  const fields = Array.isArray(schema.fields) ? schema.fields : [];
  const formId = options.formId || schema.formId || schema.id || '';

  return `
    <form class="inf-form" data-inf-form ${formId ? `id="${escapeHTML(formId)}"` : ''}>
      <header class="inf-form-head">
        <h2>${escapeHTML(schema.title || 'Form')}</h2>
      </header>

      <div class="inf-form-grid">
        ${fields.map((field) => {
          const name = String(field.name || '');
          const id = escapeHTML(fieldId(field));
          const label = escapeHTML(fieldLabel(field));
          const value = values[field.name] ?? '';
          const required = field.required ? 'required' : '';
          const placeholder = field.placeholder ? `placeholder="${escapeHTML(field.placeholder)}"` : '';

          if (field.type === 'textarea') {
            return `
              <label class="inf-field" for="${id}">
                <span>${label}</span>
                <textarea
                  id="${id}"
                  name="${escapeHTML(name)}"
                  ${placeholder}
                  ${required}
                >${escapeHTML(String(value))}</textarea>
              </label>
            `;
          }

          if (field.type === 'select') {
            const optionsList = fieldOptions(field);
            return `
              <label class="inf-field" for="${id}">
                <span>${label}</span>
                <select id="${id}" name="${escapeHTML(name)}" ${required}>
                  <option value="">Select ${label}</option>
                  ${optionsList.map((option) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? (option.label || option.value) : option;
                    const selected = String(value) === String(optionValue) ? 'selected' : '';
                    return `<option value="${escapeHTML(String(optionValue))}" ${selected}>${escapeHTML(String(optionLabel))}</option>`;
                  }).join('')}
                </select>
              </label>
            `;
          }

          if (field.type === 'radio') {
            const optionsList = fieldOptions(field);
            return `
              <fieldset class="inf-field">
                <span>${label}</span>
                <div class="inf-radio-group">
                  ${optionsList.map((option) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? (option.label || option.value) : option;
                    const checked = String(value) === String(optionValue) ? 'checked' : '';
                    return `
                      <label class="inf-field-inline">
                        <input
                          type="radio"
                          name="${escapeHTML(name)}"
                          value="${escapeHTML(String(optionValue))}"
                          ${checked}
                          ${required}
                        />
                        <span>${escapeHTML(String(optionLabel))}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </fieldset>
            `;
          }

          if (field.type === 'checkbox') {
            return `
              <label class="inf-field inf-field-inline" for="${id}">
                <input
                  id="${id}"
                  type="checkbox"
                  name="${escapeHTML(name)}"
                  ${value ? 'checked' : ''}
                />
                <span>${label}</span>
              </label>
            `;
          }

          return `
            <label class="inf-field" for="${id}">
              <span>${label}</span>
              <input
                id="${id}"
                type="${escapeHTML(field.type || 'text')}"
                name="${escapeHTML(name)}"
                value="${escapeHTML(String(value))}"
                ${placeholder}
                ${required}
              />
            </label>
          `;
        }).join('')}
      </div>

      <footer class="inf-form-actions">
        <button type="submit">Send</button>
      </footer>
    </form>
  `;
}

export function bindAutosave(formRoot, storageKey) {
  if (!storageKey) return () => {};
  const form = formRoot.querySelector('[data-inf-form]');
  if (!form) return () => {};

  const load = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);

      Object.entries(data).forEach(([name, value]) => {
        const inputs = form.querySelectorAll(`[name="${CSS.escape(name)}"]`);
        if (!inputs.length) return;

        inputs.forEach((input) => {
          if (input.type === 'checkbox') input.checked = Boolean(value);
          else if (input.type === 'radio') input.checked = String(input.value) === String(value);
          else input.value = value;
        });
      });
    } catch {}
  };

  const save = () => {
    const data = {};
    form.querySelectorAll('input, textarea, select').forEach((input) => {
      if (!input.name) return;
      if (input.type === 'radio' && !input.checked) return;
      data[input.name] = input.type === 'checkbox' ? input.checked : input.value;
    });
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  load();
  form.addEventListener('input', save);
  form.addEventListener('change', save);

  return () => {
    form.removeEventListener('input', save);
    form.removeEventListener('change', save);
  };
}

export function serializeForm(form) {
  const data = {};
  const fd = new FormData(form);

  for (const [key, value] of fd.entries()) {
    if (data[key] !== undefined) {
      if (!Array.isArray(data[key])) data[key] = [data[key]];
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }

  form.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    if (input.name && !fd.has(input.name)) data[input.name] = false;
  });

  return data;
}
