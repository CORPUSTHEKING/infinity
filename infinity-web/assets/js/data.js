let cachedManifest = null;
let manifestPromise = null;

export function manifestTree(manifest) {
  if (Array.isArray(manifest)) return manifest;
  if (manifest && Array.isArray(manifest.categories)) return manifest.categories;
  if (manifest && Array.isArray(manifest.tree)) return manifest.tree;
  return [];
}

async function fetchJson(path) {
  const res = await fetch(path, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

export async function getManifest() {
  if (cachedManifest) return cachedManifest;
  if (manifestPromise) return manifestPromise;

  manifestPromise = (async () => {
    const sources = [
      './assets/payloads/manifest.json',
      './config/scripts.json'
    ];

    for (const source of sources) {
      try {
        const json = await fetchJson(source);
        cachedManifest = json;
        return json;
      } catch (error) {
        continue;
      }
    }

    cachedManifest = [];
    return [];
  })();

  return manifestPromise;
}

function nodeSearchText(node = {}, fields = []) {
  const fallbackFields = fields.length
    ? fields
    : ['name', 'title', 'path', 'description', 'author', 'owner', 'version', 'shell', 'language', 'category', 'id'];

  return fallbackFields
    .map((field) => {
      const value = node?.[field];
      if (Array.isArray(value)) return value.join(' ');
      if (value && typeof value === 'object') return Object.values(value).join(' ');
      return value ?? '';
    })
    .join(' ')
    .toLowerCase();
}

export async function searchScripts(query) {
  const manifest = await getManifest();
  const q = String(query || '').trim().toLowerCase();

  if (!q) return [];

  const results = [];
  const stack = [...manifestTree(manifest)];

  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;

    if (node.type === 'file') {
      const haystack = nodeSearchText(node, Array.isArray(manifest?.index_fields) ? manifest.index_fields : []);
      if (haystack.includes(q)) {
        results.push(node);
      }
    }

    if (Array.isArray(node.children) && node.children.length) {
      stack.push(...node.children);
    }
  }

  return results.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
}
