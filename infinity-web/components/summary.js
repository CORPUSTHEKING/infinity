export const Summary = {
    getStats: async () => {
        const res = await fetch('config/scripts.json');
        const data = await res.json();
        return {
            total: data.length,
            categories: [...new Set(data.map(s => s.category))].length,
            latest: data[0]?.title || 'None'
        };
    },
    render: async (container) => {
        const stats = await Summary.getStats();
        container.innerHTML = `
            <div class="summary-card">
                <div class="stat-box"><span>Scripts</span><strong>${stats.total}</strong></div>
                <div class="stat-box"><span>Groups</span><strong>${stats.categories}</strong></div>
                <div class="stat-box"><span>Latest</span><small>${stats.latest}</small></div>
            </div>
        `;
    }
};
