export function initSearchDock() {
    const dock = document.getElementById('search-dock');
    const toggle = document.getElementById('search-toggle');
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    
    let scriptsData = [];

    toggle.addEventListener('click', async () => {
        dock.classList.toggle('hidden');
        if (!dock.classList.contains('hidden')) {
            input.focus();
            if (scriptsData.length === 0) {
                try {
                    const res = await fetch('config/scripts.json');
                    scriptsData = await res.json();
                } catch(e) { console.error("Search data load failed", e); }
            }
        }
    });

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) {
            results.innerHTML = '';
            return;
        }
        
        // Basic fuzzy/regex capable search
        const matches = scriptsData.filter(s => 
            s.title.toLowerCase().includes(query) || 
            s.description.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            results.innerHTML = matches.map(m => `<div style="padding: 10px; border-bottom: 1px solid #333; cursor: pointer;"><strong>${m.title}</strong> - <small>${m.category}</small></div>`).join('');
        } else {
            results.innerHTML = `<div style="padding: 10px; color: #888;">No scripts found matching "${query}"</div>`;
        }
    });
}
