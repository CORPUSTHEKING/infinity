export function bindCardActions(root, handlers = {}) {
  if (!root) return () => {};

  const onClick = (event) => {
    const expandButton = event.target.closest('[data-script-expand]');
    const actionButton = event.target.closest('[data-action]');
    const card = event.target.closest('[data-script-card]');

    if (!card) return;
    const itemId = card.getAttribute('data-script-id');

    if (expandButton) {
      const nextExpanded = !card.classList.contains('is-expanded');
      card.classList.toggle('is-expanded', nextExpanded);
      expandButton.setAttribute('aria-expanded', String(nextExpanded));
      handlers.onExpand?.(itemId, card, nextExpanded);
      return;
    }

    if (actionButton) {
      const action = actionButton.getAttribute('data-action');

      actionButton.classList.add('btn-loading');
      window.setTimeout(() => {
        actionButton.classList.remove('btn-loading');
      }, 800);

      handlers.onAction?.(action, itemId, card);
    }
  };

  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}

function encodePathSegments(path = '') {
  return String(path)
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function handleDownload(itemNode, siteConfig) {
  if (!itemNode || !itemNode.path) {
    console.error('[Infinity] Download failed: Invalid item or missing path.');
    return;
  }

  const repoUrl = String(siteConfig?.repoUrl || 'https://github.com/CORPUSTHEKING/infinity').replace(/\/+$/, '');
  const branch = encodeURIComponent(siteConfig?.branch || 'main');
  const itemPath = String(itemNode.path);

  const downloadUrl = new URL(`./assets/payloads/${encodePathSegments(itemPath)}`, document.baseURI).href;

  if (itemNode.type === 'file' || !itemNode.type) {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = itemNode.name || itemNode.path;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`[Infinity] Triggered download: ${downloadUrl}`);
    return;
  }

  if (itemNode.type === 'directory') {
    const githubFolderUrl = `${repoUrl}/tree/${branch}/infinity-web/assets/payloads/${encodePathSegments(itemPath)}`;
    if (confirm(`Directory: "${itemNode.name}"\n\nBrowsers cannot natively download folders. Redirect to GitHub repo?`)) {
      window.open(githubFolderUrl, '_blank', 'noopener');
    }
  }
}
