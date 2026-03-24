export const Platforms = {
    render: async () => {
        const res = await fetch('config/platforms.json');
        const platforms = await res.json();
        
        return `
            <div class="page-container">
                <header class="section-title">
                    <h1>CONNECT</h1>
                    <p>Follow the Infinity ecosystem across the web.</p>
                </header>
                <div class="platforms-grid">
                    ${Object.entries(platforms).map(([key, value]) => `
                        <a href="${value}" class="platform-card" target="_blank">
                            <div class="platform-name">${key.toUpperCase()}</div>
                            <div class="platform-link">View Profile 󰒄</div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }
};
