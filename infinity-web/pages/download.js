export function renderDownloadPage(items = []) {
  return `
    <section class="inf-page">
      <h2>Downloads</h2>
      <p>Immediate download actions for scripts and sections.</p>
      <div class="inf-download-list">
        ${items.map(item => `
          <article class="inf-download-item">
            <strong>${item.name || item.title || 'Untitled'}</strong>
            <p>${item.description || ''}</p>
            <button type="button" data-download-id="${item.id || ''}">Download</button>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}
