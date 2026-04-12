/**
 * INFINITY-WEB: Search Component
 * Handles fuzzy filtering of the scripts manifest.
 */
export const initSearch = (scripts) => {
    const input = document.getElementById('searchInput');
    if (!input) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        // Logic to filter the grid cards goes here
        console.log("Searching for:", query);
    });
};
