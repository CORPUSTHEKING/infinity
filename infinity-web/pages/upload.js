export const Upload = {
    render: async () => {
        return `
            <div class="page-container">
                <section class="section-title">
                    <h1>CONTRIBUTE</h1>
                    <p>Share your mastery with the Infinity ecosystem.</p>
                </section>
                <form id="upload-form" class="infinity-form">
                    <div class="form-group">
                        <label>Script Title</label>
                        <input type="text" id="up-title" required placeholder="e.g., auto-git-sync">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="up-cat">
                            <option value="assistance">Assistance</option>
                            <option value="devices">Devices</option>
                            <option value="download">General Tool</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Script Body / URL</label>
                        <textarea id="up-body" rows="8" required placeholder="Paste code or provide a link to the file..."></textarea>
                    </div>
                    <div class="form-group sponsor-check">
                        <input type="checkbox" id="up-sponsor">
                        <label for="up-sponsor">I am an active Infinity Sponsor</label>
                    </div>
                    <button type="submit" class="btn-glow">SUBMIT FOR REVIEW</button>
                </form>
            </div>
        `;
    },
    afterRender: async () => {
        document.getElementById('upload-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const isSponsor = document.getElementById('up-sponsor').checked;
            const body = `
### Script Submission
**Title:** ${document.getElementById('up-title').value}
**Category:** ${document.getElementById('up-cat').value}
**Sponsor Status:** ${isSponsor ? 'YES' : 'NO'}

**Content:**
${document.getElementById('up-body').value}
            `;
            const issueUrl = `https://github.com/CORPUSTHEKING/INFINITY/issues/new?title=[UPLOAD]+${encodeURIComponent(document.getElementById('up-title').value)}&body=${encodeURIComponent(body)}`;
            window.open(issueUrl, '_blank');
        });
    }
};
