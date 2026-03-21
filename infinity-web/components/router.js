const ROUTES = {
  home: 'assistance',
  assistance: 'assistance',
  download: 'download',
  search: 'search',
  share: 'share',
  upload: 'upload',
  request: 'request',
  review: 'review',
  report: 'report',
  sponsor: 'sponsor',
  platforms: 'platforms',
  devices: 'devices',
  disclaimer: 'disclaimer',
  terminal: 'terminal',
  iwl: 'iwl',
  profile: 'profile'
};

export function normalizeRoute(hash = '') {
  const clean = String(hash || '').replace(/^#/, '').trim().toLowerCase();
  return ROUTES[clean] || clean || 'assistance';
}

export function getRouteFromLocation() {
  return normalizeRoute(window.location.hash);
}

export function navigate(route) {
  window.location.hash = `#${route}`;
}

export function onRouteChange(handler) {
  const run = () => handler(getRouteFromLocation());
  window.addEventListener('hashchange', run);
  run();
  return () => window.removeEventListener('hashchange', run);
}

export function getRouteMap() {
  return { ...ROUTES };
}
