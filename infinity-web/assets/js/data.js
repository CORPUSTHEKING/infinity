let cachedManifest = null;

export async function getManifest() {
  if (cachedManifest) return cachedManifest;
  try {
    // 1. CHANGE: Point to the unified manifest instead of the raw one
    const res = await fetch('./assets/payloads/unified-manifest.json');
    if (!res.ok) throw new Error('Unified manifest not found');
    cachedManifest = await res.json();
    return cachedManifest;
  } catch (err) {
    console.error('Failed to load script manifest:', err);
    return [];
  }
}

export async function searchScripts(query) {
  const manifest = await getManifest();
  const results = [];
  const q = query.toLowerCase();

  function traverse(nodes) {
    for (const node of nodes) {
      if (node.type === 'file') {
        // 2. CHANGE: Search in both the filename AND the description field
        const nameMatch = node.name.toLowerCase().includes(q);
        const descMatch = node.description && node.description.toLowerCase().includes(q);
        
        if (nameMatch || descMatch) {
          results.push(node);
        }
      } else if (node.type === 'directory' && node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(manifest);
  return results;
}
