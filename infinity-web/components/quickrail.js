export const QuickRail = {
    init: (container) => {
        const navItems = [
            { label: 'Home', hash: '#download', icon: '󰋜' },
            { label: 'Help', hash: '#assistance', icon: '󰘥' },
            { label: 'Upload', hash: '#upload', icon: '󰛖' },
            { label: 'IWL', hash: '#iwl', icon: '󰈙', highlight: true },
            { label: 'Connect', hash: '#platforms', icon: '󰒄' }
        ];

        container.innerHTML = navItems.map(item => `
            <a href="${item.hash}" class="rail-item ${item.highlight ? 'rail-special' : ''}">
                <span class="rail-icon">${item.icon}</span>
                <span class="rail-label">${item.label}</span>
            </a>
        `).join('');
    }
};
