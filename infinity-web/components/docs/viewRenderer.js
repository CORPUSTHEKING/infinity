import { handleDownload } from '../cardActions.js';

export function renderDocView(docId, rawMarkdown, scriptData) {
    const screenshotHtml = scriptData?.thumbnail 
        ? `<div class="inf-doc-screenshot"><img src="${scriptData.thumbnail}" alt="Preview"></div>` 
        : '';

    const downloadButtonHtml = scriptData 
        ? `<div class="inf-doc-dl-section">
             <button id="doc-dl-btn" class="inf-btn-download-big">Download ${scriptData.name || 'Script'}</button>
           </div>`
        : '';

    const htmlContent = window.marked ? window.marked.parse(rawMarkdown) : `<pre>${rawMarkdown}</pre>`;

    return `
        <div class="inf-page inf-doc-viewer">
            <div class="inf-doc-header">
                <a href="#download" class="inf-btn-back">← BACK TO EXPLORER</a>
            </div>
            ${screenshotHtml}
            <article class="markdown-body">
                ${htmlContent}
            </article>
            ${downloadButtonHtml}
        </div>
    `;
}

export function bindDocActions(scriptData, config) {
    const btn = document.getElementById('doc-dl-btn');
    if (btn && scriptData) {
        btn.onclick = () => handleDownload(scriptData, config);
    }
}
