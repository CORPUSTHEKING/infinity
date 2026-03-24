export const SearchDock = {
    init: (container) => {
        container.innerHTML = `
            <div class="search-overlay">
                <div class="search-header">
                    <input type="text" id="search-query-input" placeholder="Search scripts (Regex supported)...">
                    <button id="close-search">✕</button>
                </div>
                <div id="search-results-area"></div>
            </div>
        `;

        const input = document.getElementById('search-query-input');
        const resultsArea = document.getElementById('search-results-area');

        input.addEventListener('input', async (e) => {
            const query = e.target.value;
            if (query.length < 2) {
                resultsArea.innerHTML = '';
                return;
            }

            const res = await fetch('config/scripts.json');
            const scripts = await res.json();

            let matches = [];
            try {
                const regex = new RegExp(query, 'i');
                matches = scripts.filter(s => regex.test(s.title) || regex.test(s.category));
            } catch (err) {
                // Fallback to simple includes if regex is invalid while typing
                matches = scripts.filter(s => s.title.toLowerCase().includes(query.toLowerCase()));
            }

            resultsArea.innerHTML = matches.map(m => `
                <div class="search-result-item" onclick="window.location.hash='#download';">
                    <span class="res-cat">${m.category}</span>
                    <span class="res-title">${m.title}</span>
                </div>
            `).join('');
        });

        document.getElementById('close-search').addEventListener('click', () => {
            container.classList.add('hidden');
        });
    }
};
