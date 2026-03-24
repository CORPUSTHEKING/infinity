import { renderScriptCards } from './cards.js';

export function renderCategoriesView(tree = [], { query = '' } = {}) {
    const totalScripts = tree.reduce((acc, node) => acc + (node.children?.length || 0), 0);
    
    return `
    <div class="inf-categories">
        <div class="inf-hero-panoramic">
            <div class="pan-text-scroller">
                <marquee scrollamount="5"> 🚀 SYSTEM READY... ${totalScripts} UTILITIES INDEXED... SELECT A CATEGORY TO BEGIN... </marquee>
            </div>
        </div>

        ${tree.map(node => {
            if (node.type !== 'directory') return '';
            const files = node.children.filter(c => c.type === 'file');
            return `
            <section class="inf-category">
                <div class="inf-category-head">
                    <h2>${node.name.toUpperCase()}</h2>
                    <span class="inf-badge">${files.length} ITEMS</span>
                </div>
                <div class="inf-cards-rail">
                    ${renderScriptCards(files)}
                </div>
            </section>
            `;
        }).join('')}
    </div>`;
}

export function renderSearchResultsView(results = [], query = '') {
    return `
    <div class="inf-categories">
        <section class="inf-category">
            <div class="inf-category-head">
                <h2>SEARCH RESULTS</h2>
                <span class="inf-badge">${results.length} MATCHES</span>
            </div>
            <div class="inf-cards-rail">
                ${renderScriptCards(results)}
            </div>
        </section>
    </div>`;
}
