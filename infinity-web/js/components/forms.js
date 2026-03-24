let siteConfig = null;

async function loadConfigs() {
    if (!siteConfig) {
        const res = await fetch('config/site.json');
        siteConfig = await res.json();
    }
}

export async function initIWLModal() {
    await loadConfigs();
    const modal = document.getElementById('iwl-modal');
    const trigger = document.getElementById('trigger-iwl');
    const closeBtn = document.getElementById('close-iwl');
    const container = document.getElementById('iwl-form-container');

    trigger.addEventListener('click', async (e) => {
        e.preventDefault();
        modal.classList.remove('hidden');
        await renderFormView('iwl', container);
    });

    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
}

export async function renderFormView(formKey, container) {
    try {
        await loadConfigs();
        const response = await fetch('config/forms.json');
        const forms = await response.json();
        const config = forms[formKey];

        if (!config) throw new Error("Form config not found");

        let html = `<form class="dynamic-form" id="form-${formKey}">`;
        
        config.fields.forEach(f => {
            html += `<label>${f.label}</label>`;
            if (f.type === 'textarea') {
                html += `<textarea name="${f.name}" rows="4" ${f.required ? 'required' : ''}></textarea>`;
            } else if (f.type === 'select') {
                html += `<select name="${f.name}">`;
                f.options.forEach(opt => html += `<option value="${opt}">${opt}</option>`);
                html += `</select>`;
            } else {
                html += `<input type="${f.type}" name="${f.name}" ${f.required ? 'required' : ''}>`;
            }
        });

        html += `<button type="submit">${config.submitText}</button></form>`;
        container.innerHTML = html;

        // Handle submission to route data via email
        document.getElementById(`form-${formKey}`).addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            let bodyText = `New ${formKey.toUpperCase()} Submission:\n\n`;
            for (let [key, value] of formData.entries()) {
                bodyText += `${key.toUpperCase()}: ${value}\n`;
            }
            
            const mailto = `mailto:${siteConfig.contactEmail}?subject=Infinity ${formKey.toUpperCase()} Submission&body=${encodeURIComponent(bodyText)}`;
            window.location.href = mailto;
            
            if (formKey === 'iwl') {
                document.getElementById('iwl-modal').classList.add('hidden');
            }
        });

    } catch (error) {
        container.innerHTML = `<p>Error loading form configuration.</p>`;
        console.error(error);
    }
}
