import { renderAssistancePage } from '../pages/assistance.js';
import { renderDevicesPage } from '../pages/devices.js';
import { renderDisclaimerPage } from '../pages/disclaimer.js';
import { renderIwlPage } from '../pages/iwl.js';
import { renderPlatformsPage } from '../pages/platforms.js';
import { renderReportPage } from '../pages/report.js';
import { renderRequestPage } from '../pages/request.js';
import { renderReviewPage } from '../pages/review.js';
import { renderSearchPage } from '../pages/search.js';
import { renderSharePage } from '../pages/share.js';
import { renderSponsorPage } from '../pages/sponsor.js';
import { renderTerminalPage } from '../pages/terminal.js';
import { renderUploadPage, bindUploadEvents } from '../pages/upload.js';
import { getManifest, searchScripts } from '../assets/js/data.js';
import { handleDownloadPageRoute } from './router/download.js';
import { handleDocsPageRoute } from './router/docs.js';
import { dynamicRoutes } from './router/scan.js';

function resolveFormSchema(config, key) {
  return config?.forms?.[key]
    || config?.forms?.forms?.[key]
    || {};
}

function resolveList(config, key) {
  const value = config?.[key];
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value[key])) return value[key];
  return [];
}

export function initRouter(ui, config) {
  const scope = ui.root || document;
  let uploadCleanup = null;

  async function handleRoute() {
    const rawHash = window.location.hash.replace('#', '') || 'assistance';
    const [hashPath, queryString] = rawHash.split('?');
    const hash = hashPath || 'assistance';
    const urlParams = new URLSearchParams(queryString || '');

    scope.querySelectorAll('.inf-bottombar a, .inf-drawer a').forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href')?.replace('#', '');
      if (href && href.split('?')[0] === hash) {
        link.classList.add('active');
      }
    });

    if (uploadCleanup) {
      uploadCleanup();
      uploadCleanup = null;
    }

    switch (hash) {
      case 'docs':
        await handleDocsPageRoute(ui, urlParams);
        break;

      case 'assistance':
      case 'home':
        ui.setPageContent(renderAssistancePage(config));
        break;

      case 'download':
        await handleDownloadPageRoute(ui, config);
        break;

      case 'search': {
        const query = urlParams.get('q') || '';
        if (!query) {
          ui.setPageContent('<div class="inf-page"><p>Please enter a search term.</p></div>');
          break;
        }

        ui.setPageContent('<div class="inf-page"><p class="inf-loading">Searching...</p></div>');
        const results = await searchScripts(query);
        ui.setPageContent(renderSearchPage(results, query));
        break;
      }

      case 'share':
        ui.setPageContent(renderSharePage(resolveFormSchema(config, 'share')));
        break;

      case 'upload':
        ui.setPageContent(renderUploadPage(resolveFormSchema(config, 'upload')));
        uploadCleanup = bindUploadEvents(config);
        break;

      case 'request':
        ui.setPageContent(renderRequestPage(resolveFormSchema(config, 'request')));
        break;

      case 'review':
        ui.setPageContent(renderReviewPage(resolveFormSchema(config, 'review')));
        break;

      case 'report':
        ui.setPageContent(renderReportPage(resolveFormSchema(config, 'report')));
        break;

      case 'iwl':
        ui.setPageContent(renderIwlPage(resolveFormSchema(config, 'iwl')));
        break;

      case 'platforms':
        ui.setPageContent(renderPlatformsPage(resolveList(config, 'platforms')));
        break;

      case 'devices':
        ui.setPageContent(renderDevicesPage(resolveList(config, 'devices')));
        break;

      case 'disclaimer':
        ui.setPageContent(renderDisclaimerPage(config));
        break;

      case 'terminal':
        ui.setPageContent(renderTerminalPage(config));
        break;

      case 'sponsor':
        ui.setPageContent(renderSponsorPage(config));
        break;

      default:
        if (dynamicRoutes[hash]) {
          try {
            await dynamicRoutes[hash](ui, urlParams, config);
          } catch (err) {
            console.error(`[Router] Failed to load dynamic route: ${hash}`, err);
            ui.setPageContent('<div class="inf-page"><h2>Execution Error</h2></div>');
          }
        } else {
          ui.setPageContent(`
            <div class="inf-page">
              <h2>${String(hash).toUpperCase()}</h2>
              <p>Information regarding ${String(hash)} is currently being updated.</p>
            </div>
          `);
        }
        break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
