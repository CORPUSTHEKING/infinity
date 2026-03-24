export const Drawer = {
    toggle: () => {
        const drawer = document.getElementById('category-drawer');
        drawer.classList.toggle('open');
    },
    render: (categories, container) => {
        container.innerHTML = `
            <div id="category-drawer" class="drawer">
                <div class="drawer-header">Categories <button id="close-drawer">✕</button></div>
                <div class="drawer-content">
                    ${categories.map(cat => `
                        <div class="drawer-item" data-cat="${cat}">${cat.toUpperCase()}</div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.getElementById('close-drawer').onclick = () => Drawer.toggle();
    }
};
