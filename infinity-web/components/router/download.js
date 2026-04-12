import { getManifest, manifestTree } from '../../assets/js/data.js';
import { bindCardActions, handleDownload } from '../cardActions.js';
import { renderDownloadPage } from '../../pages/download.js';

function findItemById(data, id) {
  const nodes = Array.isArray(data) ? data : manifestTree(data);

  for (const item of nodes) {
    if (!item) continue;

    if (String(item.id) === String(id)) {
      return item;
    }

    if (Array.isArray(item.children) && item.children.length > 0) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }

  return null;
}

export async function handleDownloadPageRoute(ui, config) {
  ui.setPageContent('<div class="inf-page"><p class="inf-loading">Loading script manifest...</p></div>');

  try {
    const manifestData = await getManifest();
    const tree = manifestTree(manifestData);

    if (tree.length > 0) {
      ui.setPageContent(renderDownloadPage(tree));

      const mainContainer =
        ui.root?.querySelector('[data-inf-main]') ||
        document.querySelector('.inf-main');

      bindCardActions(mainContainer, {
        onAction: (action, itemId) => {
          if (action === 'download') {
            const item = findItemById(tree, itemId);
            if (item) {
              handleDownload(item, config);
            } else {
              console.error(`[Infinity] Could not locate metadata for item ID: ${itemId}`);
            }
          }
        }
      });
    } else {
      ui.setPageContent('<div class="inf-page"><p>No scripts found. Please run the manifest generator.</p></div>');
    }
  } catch (error) {
    console.error('[Infinity] Failed to load download page data:', error);
    ui.setPageContent('<div class="inf-page"><p class="inf-error">Error loading downloads. Check console.</p></div>');
  }
}
