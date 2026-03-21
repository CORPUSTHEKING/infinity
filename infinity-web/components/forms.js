export function renderForm(schema = {}, values = {}) {
  const fields = Array.isArray(schema.fields) ? schema.fields : [];
  return `
    <form class="inf-form" data-inf-form>
      <header class="inf-form-head">
        <h2>${schema.title || 'Form'}</h2>
      </header>
      <div class="inf-form-grid">
        ${fields.map((field) => {
          const value = values[field.name] ?? '';
          const required = field.required ? 'required' : '';
          if (field.type === 'textarea') {
            return `
              <label class="inf-field">
                <span>${field.name}</span>
                <textarea name="${field.name}" ${required}>${String(value)}</textarea>
              </label>
            `;
          }
          if (field.type === 'checkbox') {
            return `
              <label class="inf-field inf-field-inline">
                <input type="checkbox" name="${field.name}" ${value ? 'checked' : ''} />
                <span>${field.name}</span>
              </label>
            `;
          }
          return `
            <label class="inf-field">
              <span>${field.name}</span>
              <input type="${field.type || 'text'}" name="${field.name}" value="${String(value)}" ${required} />
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
        const input = form.querySelector(`[name="${CSS.escape(name)}"]`);
        if (!input) return;
        if (input.type === 'checkbox') input.checked = Boolean(value);
        else input.value = value;
      });
    } catch {}
  };

  const save = () => {
    const data = {};
    form.querySelectorAll('input, textarea, select').forEach((input) => {
      if (!input.name) return;
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
