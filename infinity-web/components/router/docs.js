import { escapeHTML } from '../utils/html.js';

export async function handleDocsPageRoute(ui, urlParams) {
  const docId = String(urlParams.get('id') || '').trim();

  if (!docId) {
    ui.setPageContent(`
      <div class="inf-page">
        <h2>Documentation Error</h2>
        <p>No document ID specified.</p>
        <a href="#home" class="inf-btn-primary">Return Home</a>
      </div>
    `);
    return;
  }

  ui.setPageContent('<div class="inf-page"><p class="inf-loading">Loading documentation...</p></div>');

  try {
    const response = await fetch(`./assets/docs/${encodeURIComponent(docId)}.md`, {
      cache: 'force-cache'
    });

    if (!response.ok) throw new Error('Document not found');

    const rawMarkdown = await response.text();
    const htmlContent = window.marked?.parse
      ? window.marked.parse(rawMarkdown)
      : `<pre>${escapeHTML(rawMarkdown)}</pre>`;

    ui.setPageContent(`
      <div class="inf-page inf-doc-viewer">
        <div class="inf-doc-header">
          <a href="#home" style="color: var(--primary); text-decoration: none; font-size: 0.8rem;">← BACK</a>
        </div>
        <article class="markdown-body">
          ${htmlContent}
        </article>
      </div>
    `);
  } catch (error) {
    ui.setPageContent(`
      <div class="inf-page">
        <h2>404</h2>
        <p>Documentation for "${escapeHTML(docId)}" could not be found.</p>
        <a href="#home" class="inf-btn-primary">Back to Home</a>
      </div>
    `);
  }
}
