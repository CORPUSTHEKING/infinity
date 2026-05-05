let cachedManifest = null;

export async function getManifest() {
  if (cachedManifest) return cachedManifest;
  try {
    // 1. Load both files concurrently
    const [treeRes, docsRes] = await Promise.all([
      fetch('./assets/payloads/manifest.json'),
      fetch('./assets/payloads/docs-manifest.json')
    ]);

    if (!treeRes.ok || !docsRes.ok) throw new Error('Failed to fetch manifest data');

    const tree = await treeRes.json();
    const docs = await docsRes.json();

    // 2. Create a lookup map for descriptions (using slug/id)
    const docsMap = docs.reduce((acc, doc) => {
      acc[doc.slug] = doc;
      return acc;
    }, {});

    // 3. Traverse the manifest tree and inject documentation
    function hydrate(nodes) {
      for (const node of nodes) {
        if (node.type === 'file') {
          // Merge doc properties (description, author, etc.) into the file node
          Object.assign(node, docsMap[node.id] || {});
        } else if (node.type === 'directory' && node.children) {
          hydrate(node.children);
        }
      }
    }

    hydrate(tree);
    cachedManifest = tree;
    return cachedManifest;

  } catch (err) {
    console.error('Infinity: Manifest hydration failed:', err);
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
        // Search in the hydrated fields
        const inName = node.name.toLowerCase().includes(q);
        const inDesc = node.description && node.description.toLowerCase().includes(q);
        
        if (inName || inDesc) results.push(node);
      } else if (node.type === 'directory' && node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(manifest);
  return results;
}
