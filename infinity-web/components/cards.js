export function renderScriptCards(items = [], actions = {}) {
  return `
    <section class="inf-cards-rail" aria-label="Scripts">
      ${items.map((item) => `
        <article class="inf-card" data-script-card data-script-id="${item.id || ''}">
          <header class="inf-card-head">
            <div class="inf-card-author">${item.author || item.owner || 'Unknown author'}</div>
            <h3 class="inf-card-title">${item.name || item.title || 'Untitled script'}</h3>
          </header>

          <button type="button" class="inf-card-body" data-script-expand>
            <p>${item.description || item.summary || 'No description provided.'}</p>
          </button>

          <footer class="inf-card-foot">
            <div class="inf-card-meta">
              <span>${item.shell || ''}</span>
              <span>${item.language || ''}</span>
              <span>${item.category || ''}</span>
            </div>
            <div class="inf-card-actions">
              <button type="button" data-action="download">Download</button>
              <button type="button" data-action="share">Share</button>
              <button type="button" data-action="request">Request</button>
              <button type="button" data-action="report">Report</button>
            </div>
            <pre class="inf-card-deps">${Array.isArray(item.dependencies) ? item.dependencies.join('\n') : (item.dependencies || '')}</pre>
          </footer>
        </article>
      `).join('')}
    </section>
  `;
}

export function bindCardActions(root, handlers = {}) {
  root.querySelectorAll('[data-script-card]').forEach((card) => {
    const itemId = card.getAttribute('data-script-id');

    card.querySelector('[data-script-expand]')?.addEventListener('click', () => {
      handlers.onExpand?.(itemId, card);
    });

    card.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const action = event.currentTarget.getAttribute('data-action');
        handlers.onAction?.(action, itemId, card);
      });
    });
  });
}
