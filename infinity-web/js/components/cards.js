export async function renderCards(container) {
    try {
        const response = await fetch('config/scripts.json');
        const scripts = await response.json();
        
        let html = `<div class="cards-wrapper">`;
        scripts.forEach(script => {
            html += `
                <div class="card" onclick="alert('Viewing: ${script.title}\\nAuthor: ${script.author}\\nDownloads: ${script.downloads}')">
                    <h3>${script.title}</h3>
                    <div class="meta">By: ${script.author} | Dls: ${script.downloads}</div>
                    <div class="desc">${script.description}</div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<p>Error loading scripts data.</p>`;
        console.error(error);
    }
}
