import { State } from '../components/state.js';

export const IWL = {
    render: async () => {
        const savedData = State.get('iwl_draft') || { name: '', email: '', request: '' };
        return `
            <div class="page-container">
                <section class="hero-mini">
                    <h1>I WOULD LIKE...</h1>
                    <p>Your request is automatically saved as you type.</p>
                </section>
                <form id="iwl-form" class="infinity-form">
                    <input type="text" id="iwl-name" placeholder="Name/Alias" value="${savedData.name}">
                    <input type="email" id="iwl-email" placeholder="Contact Email" value="${savedData.email}">
                    <textarea id="iwl-request" placeholder="Describe what you need..." rows="6">${savedData.request}</textarea>
                    <button type="submit" class="btn-glow">Submit Request</button>
                    <div id="status-msg"></div>
                </form>
            </div>
        `;
    },
    afterRender: async () => {
        const fields = ['iwl-name', 'iwl-email', 'iwl-request'];
        
        // Auto-save logic
        fields.forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                const draft = {
                    name: document.getElementById('iwl-name').value,
                    email: document.getElementById('iwl-email').value,
                    request: document.getElementById('iwl-request').value
                };
                State.set('iwl_draft', draft);
                document.getElementById('status-msg').innerText = "Draft saved locally...";
            });
        });

        document.getElementById('iwl-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const body = `Name: ${document.getElementById('iwl-name').value}\nEmail: ${document.getElementById('iwl-email').value}\nRequest: ${document.getElementById('iwl-request').value}`;
            const issueUrl = `https://github.com/CORPUSTHEKING/INFINITY/issues/new?title=[IWL]+Request&body=${encodeURIComponent(body)}`;
            window.open(issueUrl, '_blank');
        });
    }
};
