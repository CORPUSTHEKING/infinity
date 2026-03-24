export const Layout = {
    init: async (container) => {
        // Fetch current count for the TopBar
        let scriptCount = 0;
        try {
            const res = await fetch('config/scripts.json');
            const data = await res.json();
            scriptCount = data.length;
        } catch (e) { scriptCount = '...'; }

        container.innerHTML = `
            <div class="topbar-inner">
                <div class="logo-area" onclick="window.location.hash=''">
                    <span class="logo-symbol">∞</span>
                    <span class="logo-text">INFINITY <small>v2.0</small></span>
                </div>
                
                <div class="topbar-actions">
                    <div class="live-counter-pill">
                        <span class="pulse-dot"></span>
                        <span class="count-val">${scriptCount}</span>
                        <span class="count-label">SCRIPTS ACTIVE</span>
                    </div>
                    <button id="search-trigger" class="icon-btn">󰍉</button>
                </div>
            </div>
        `;

        document.getElementById('search-trigger').onclick = () => {
            document.getElementById('searchdock-container').classList.toggle('hidden');
            document.getElementById('search-query-input').focus();
        };
    }
};
