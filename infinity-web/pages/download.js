export const Download = {
    render: async () => {
        try {
            const res = await fetch('config/scripts.json');
            const scripts = await res.json();
            
            return `
                <div class="page-container">
                    <section class="hero-panorama-container">
                        <div class="panorama-bg"></div>
                        <div class="hero-3d-text">INFINITY DOWNLOADS</div>
                    </section>
                    
                    <div class="content-wrapper">
                        <div class="category-header">
                            <h2>Terminal Scripts <span class="count-badge">${scripts.length}</span></h2>
                        </div>
                        <div class="scripts-grid">
                            ${scripts.map(s => `
                                <div class="script-card">
                                    <div class="card-meta">${s.category.toUpperCase()}</div>
                                    <h3>${s.title}</h3>
                                    <p>Automated terminal helper from the pool.</p>
                                    <div class="card-actions">
                                        <button class="btn-dl" onclick="window.open('${s.path}', '_blank')">GET SCRIPT</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } catch (e) {
            return `<div class="error-view">No scripts manifest found. Run the GitHub Action to sync.</div>`;
        }
    }
};
