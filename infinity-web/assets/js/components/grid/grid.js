/**
 * INFINITY-WEB: Grid Component
 * Renders the script categories and interactive cards.
 */
export const renderScriptGrid = (categories) => {
    if (!categories || categories.length === 0) return `<div class="inf-error">No scripts found.</div>`;
    
    return `
        <div class="inf-categories">
            ${categories.map(cat => `
                <section class="inf-category">
                    <div class="inf-category-head">
                        <h2>${cat.name}</h2>
                        <span class="inf-badge">${cat.children.length} items</span>
                    </div>
                    <div class="inf-cards-rail">
                        ${cat.children.map(script => `
                            <article class="inf-card" data-id="${script.id}">
                                <div class="inf-card-head">
                                    <span class="inf-card-author">@${script.author || 'Infinity'}</span>
                                    <h3 class="inf-card-title">${script.name} <small>v${script.version}</small></h3>
                                </div>
                                <div class="inf-card-body">
                                    <p>${script.description || 'No description provided.'}</p>
                                </div>
                                <div class="inf-card-foot">
                                    <div class="inf-card-actions">
                                        <button class="inf-btn-icon" onclick="window.open('${script.path}', '_blank')">
                                            <i data-lucide="download"></i>
                                        </button>
                                        <button class="inf-btn-icon"><i data-lucide="share-2"></i></button>
                                    </div>
                                </div>
                            </article>
                        `).join('')}
                    </div>
                </section>
            `).join('')}
        </div>`;
};
