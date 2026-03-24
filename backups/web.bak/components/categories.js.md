import { renderScriptCards } from './cards.js';

/**
 * Recursive helper to render the tree.
 * Directories become sections/headings, Files become cards.
 */
function renderTreeNodes(nodes, depth = 0, query = '') {
  return nodes.map(node => {
    if (node.type === 'directory') {
      return renderDirectoryNode(node, depth, query);
    } else {
      // Wrap single file in an array for the existing card renderer
      return renderScriptCards([mapNodeToScript(node)]);
    }
  }).join('');
}

/**
 * Maps a filesystem node to the object structure 
 * expected by the existing renderScriptCards component.
 */
function mapNodeToScript(node) {
  return {
    id: node.id,
    name: node.name,
    title: node.name,
    author: 'Infinity Payload',
    description: node.path, // Show the path as the description
    category: node.extension || 'file',
    shell: node.extension === '.sh' ? 'bash' : '',
    language: node.extension?.replace('.', '') || 'bin'
  };
}

/**
 * Renders a directory as a section. 
 * Root-level (depth 0) uses the full 'inf-category' layout.
 */
function renderDirectoryNode(node, depth, query = '') {
  const isRoot = depth === 0;
  const containerClass = isRoot ? 'inf-category' : 'inf-subcategory';
  const label = node.name.toUpperCase();
  
  // Use README content if available, otherwise a default description
  const description = node.readme 
    ? node.readme.substring(0, 160) + '...' 
    : `Contains ${node.children?.length || 0} items in /${node.path}`;

  return `
    <section class="${containerClass}" style="margin-left: ${depth * 0.5}rem; border-left: ${depth > 0 ? '2px solid var(--line)' : 'none'}; padding-left: ${depth > 0 ? '1rem' : '0'}">
      <div class="inf-category-head">
        <h2 style="font-size: ${isRoot ? '1.1rem' : '0.95rem'}">${label}</h2>
        <span>${node.children?.length || 0} items</span>
      </div>
      <p class="inf-category-desc">${description}${query ? ` • matching “${query}”` : ''}</p>
      
      <div class="inf-category-content">
        ${renderTreeNodes(node.children || [], depth + 1, query)}
      </div>
    </section>
  `;
}

/**
 * Primary Entry Point (Replaces original renderCategoriesView)
 */
export function renderCategoriesView(tree = [], { query = '' } = {}) {
  return `
    <div class="inf-categories">
      ${renderTreeNodes(tree, 0, query)}
    </div>
  `;
}

/**
 * Renders Search Results from a flat list of nodes 
 * returned by the search utility.
 */
export function renderSearchResultsView(results = [], query = '') {
  const scripts = results.map(mapNodeToScript);
  
  return `
    <section class="inf-category">
      <div class="inf-category-head">
        <h2>SEARCH RESULTS</h2>
        <span>${results.length} match${results.length === 1 ? '' : 'es'}</span>
      </div>
      <p class="inf-category-desc">Matches found in filenames and directory paths for “${query}”.</p>
      ${renderScriptCards(scripts)}
      ${!results.length ? `<div class="inf-result">No matching payloads found.</div>` : ''}
    </section>
  `;
}
