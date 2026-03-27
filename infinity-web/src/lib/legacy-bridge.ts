/**
 * Infinity Legacy Bridge
 * Connects modern Astro/React components to legacy JSON data stores.
 */

export async function fetchLegacyConfig(type: 'site' | 'scripts' | 'platforms' | 'devices') {
  const response = await fetch(`/config/${type}.json`);
  if (!response.ok) throw new Error(`Failed to load legacy config: ${type}`);
  return response.json();
}

export async function fetchLegacyData(category: string) {
  const response = await fetch(`/data/${category}.json`);
  if (!response.ok) throw new Error(`Failed to load legacy data: ${category}`);
  return response.json();
}

export const LEGACY_PATHS = {
  payloads: '/legacy-assets/payloads/',
  styles: '/src/assets/legacy/css/',
};
