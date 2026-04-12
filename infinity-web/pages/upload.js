import { renderForm } from '../components/forms.js';

function defaultUploadSchema() {
  return {
    formId: 'upload-form',
    title: 'Infinity Submission Portal',
    fields: [
      { id: 'up-id', name: 'id', label: 'Script / Engine ID', type: 'text', placeholder: 'e.g., custom-engine-01', required: true },
      { id: 'up-author', name: 'author', label: 'Author', type: 'text', placeholder: 'Your handle' },
      { id: 'up-category', name: 'category', label: 'Target Category', type: 'select', options: ['Engines', 'Tools', 'Plugins', 'Other'] },
      { id: 'up-desc', name: 'desc', label: 'Description', type: 'textarea', placeholder: 'What does this do?' },
      { id: 'up-code', name: 'code', label: 'Source Code / Content', type: 'textarea', placeholder: 'Paste code here...', required: true }
    ]
  };
}

function mergeSchema(schema = {}) {
  const fallback = defaultUploadSchema();
  const merged = { ...fallback, ...schema };

  merged.formId = schema.formId || fallback.formId;
  merged.title = schema.title || fallback.title;
  merged.fields = Array.isArray(schema.fields) && schema.fields.length ? schema.fields : fallback.fields;

  return merged;
}

export function renderUploadPage(schema = {}) {
  const finalSchema = mergeSchema(schema);

  return `
    <section class="inf-page container my-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card bg-dark text-white border-primary shadow-lg">
            <div class="card-header border-primary bg-transparent py-3">
              <h2 class="h4 mb-0 text-primary">
                <i class="fas fa-cloud-upload-alt me-2"></i>${finalSchema.title}
              </h2>
            </div>
            <div class="card-body">
              ${renderForm(finalSchema, {}, { formId: finalSchema.formId })}
            </div>
            <div class="card-footer border-top border-secondary small text-muted text-center">
              Logged-in users contribute via GitHub Issues. Guests contribute via secure email relay.
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function bindUploadEvents(siteConfig = {}) {
  const form = document.getElementById('upload-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const getValue = (id) => document.getElementById(id)?.value?.trim() || '';

    const formData = {
      id: getValue('up-id'),
      author: getValue('up-author') || 'Anonymous',
      category: getValue('up-category') || 'General',
      desc: getValue('up-desc') || 'No description provided.',
      code: getValue('up-code')
    };

    const payloadText = `### 🚀 New Script Submission: ${formData.id}

**Author:** ${formData.author}
**Category:** ${formData.category}
**Description:** ${formData.desc}

**Code:**
\`\`\`bash
${formData.code}
\`\`\`

-- *Submitted via Infinity Web Engine Interface*`;

    const isAuthenticated = Boolean(localStorage.getItem('infinity_token')) || Boolean(siteConfig.isLoggedIn);

    if (isAuthenticated) {
      const repo = siteConfig.repoUrl || 'https://github.com/CORPUSTHEKING/infinity';
      const issueUrl = `${repo}/issues/new?title=${encodeURIComponent('New Script: ' + formData.id)}&labels=community-submission&body=${encodeURIComponent(payloadText)}`;
      window.open(issueUrl, '_blank', 'noopener');
    } else {
      const recipients = 'corpustheking@gmail.com,mikewebah@gmail.com';
      const subject = `Infinity Script Submission: ${formData.id}`;
      const mailtoUrl = `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(payloadText)}`;
      window.location.href = mailtoUrl;
    }

    form.reset();
  });
}
