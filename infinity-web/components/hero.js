export function renderHero(siteName = 'Infinity') {
  return `
    <div class="inf-hero-media" aria-hidden="true"></div>
    <div class="inf-hero-overlay" aria-hidden="true"></div>

      <h1>${siteName}</h1>
      <p class="inf-hero-text">
        Scripts, requests, uploads, sharing, and category browsing stay inside one compact layout.
      </p>
    </div>

    <div class="inf-hero-marquee" aria-hidden="true">
      <span>scripts</span>
      <span>share</span>
      <span>request</span>
      <span>configs</span>
      <span>search</span>
    </div>
  `;
}
