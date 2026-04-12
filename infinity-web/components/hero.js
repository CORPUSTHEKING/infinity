import { escapeHTML } from './utils/html.js';
import { renderHeroOverlay } from './hero/overlay/text.js';

export function renderHero(input = {}) {
  const config = typeof input === 'string' ? { siteName: input } : (input || {});

  const siteName =
    config.site_name ||
    config.siteName ||
    config.title ||
    'Infinity Terminal Helpers';

  const showOverlay = config.showOverlay !== false;
  const overlayContent =
    config.content ??
    config.hero_content ??
    siteName;

  const overlaySubtext =
    config.subtext ??
    config.hero_subtext ??
    '';

  return `
    <div class="inf-hero-panoramic">
      ${showOverlay ? renderHeroOverlay(escapeHTML(overlayContent), escapeHTML(overlaySubtext)) : ''}
    </div>
  `;
}
