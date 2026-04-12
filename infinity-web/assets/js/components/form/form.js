/**
 * INFINITY-WEB: Form Component
 * Dynamically builds forms from JSON configuration.
 */
export const renderForm = (formData) => {
    if (!formData) return `<div class="inf-error">Form configuration missing.</div>`;
    
    return `
        <section class="inf-page inf-fade-in">
            <div class="inf-form-container">
                <header class="inf-form-header">
                    <h2>${formData.title}</h2>
                    <p class="inf-muted">Mode: ${formData.mode.replace('_', ' ')}</p>
                </header>
                <form class="inf-form" id="activeForm" data-mode="${formData.mode}">
                    ${formData.fields.map(field => `
                        <div class="inf-form-group">
                            <label class="inf-label">${field.name.toUpperCase()}</label>
                            ${field.type === 'textarea' 
                                ? `<textarea name="${field.name}" placeholder="Enter ${field.name}..." ${field.required ? 'required' : ''}></textarea>`
                                : field.type === 'select'
                                ? `<select name="${field.name}">${field.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`
                                : `<input type="${field.type}" name="${field.name}" placeholder="Enter ${field.name}..." ${field.required ? 'required' : ''}>`
                            }
                        </div>
                    `).join('')}
                    <div class="inf-form-actions">
                        <button type="submit" class="inf-btn-primary">Execute ${formData.title}</button>
                    </div>
                </form>
            </div>
        </section>`;
};
