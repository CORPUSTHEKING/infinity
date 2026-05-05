import { renderAssistancePage } from '../pages/assistance.js';
import { renderSponsorPage } from '../pages/sponsor.js';
import { renderCategoriesView, renderSearchResultsView } from './categories.js';
import { getManifest, searchScripts } from '../assets/js/data.js';
import { handleDownloadPageRoute } from './router/download.js';
import { handleDocsPageRoute } from './router/docs.js';
import { renderUploadPage, bindUploadEvents } from '../pages/upload.js';
import { renderRequestPage, bindRequestEvents } from '../pages/request.js';
import { handleSearchRoute } from '../pages/search.js';

export function initRouter(ui, config) {
  async function handleRoute() {
    // Extract hash and potential query parameters (e.g., #search?q=term)
    const rawHash = window.location.hash.replace('#', '') || 'assistance';
    const [hashPath, queryString] = rawHash.split('?');
    const hash = hashPath || 'assistance';

    const urlParams = new URLSearchParams(queryString || '');

    // Update active state in navigation links
    document.querySelectorAll('.inf-bottombar a, .inf-drawer a').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href')?.replace('#', '');
      if (href && href.split('?')[0] === hash) {
        link.classList.add('active');
      }
    });

    switch (hash) {
      case 'docs':
        await handleDocsPageRoute(ui, urlParams);
        break;
        
      case 'assistance':
      ui.setPageContent(renderAssistancePage());
    break;
    
      case 'home':
        ui.setPageContent(`
          <div class="inf-page">
            <h2>Welcome to Infinity</h2>
            <p>Your centralized hub for terminal utilities, payload scripts, and workspace configurations.</p>
            <p>Use the navigation below to browse downloads, or tap the search icon to find specific tools.</p>
          </div>
        `);
        break;
        
        case 'sponsor':
  ui.setPageContent(renderSponsorPage());
  break;

      case 'download':
        // We delegate all the work (fetching, rendering, and binding) to the sub-router
        await handleDownloadPageRoute(ui, config);
        break;

      case 'search':
        await handleSearchRoute(ui, urlParams.get('q') || '');
        break;

      case 'upload':
        ui.setPageContent(renderUploadPage());
        bindUploadEvents(config);
        break;

      case 'request':
        ui.setPageContent(renderRequestPage());
        bindRequestEvents();
        break;


      default:
        ui.setPageContent(`
          <div class="inf-page">
            <h2>${hash.toUpperCase()}</h2>
            <p>Information regarding ${hash} is currently being updated.</p>
          </div>
        `);
        break;
    }

   // window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
