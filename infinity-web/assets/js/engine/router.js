/**
 * INFINITY-ENGINE: Router
 * Handles dynamic imports of visual components.
 */
export const handleRoute = async (key, config) => {
    const container = document.getElementById('app');
    container.innerHTML = '<div class="inf-loading-shimmer"></div>';

    try {
        if (config.forms.forms[key]) {
            const { renderForm } = await import('../components/form/form.js');
            container.innerHTML = renderForm(config.forms.forms[key]);
        } else if (key === 'terminal' || key === 'download') {
            const { renderScriptGrid } = await import('../components/grid/grid.js');
            container.innerHTML = renderScriptGrid(config.scripts.categories);
        } else {
            container.innerHTML = `<section class="inf-page"><h2>${key}</h2><p>Module link broken or pending.</p></section>`;
        }
    } catch (err) {
        console.error("Routing Error:", err);
        container.innerHTML = `<div class="inf-error">Failed to load module: ${key}</div>`;
    }

    if (window.lucide) window.lucide.createIcons();
};
