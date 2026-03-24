import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const payloadsDir = path.join(webRoot, 'assets', 'payloads');
const configDir = path.join(webRoot, 'config');
const outputPath = path.join(configDir, 'scripts.json');

async function safeReadFile(filePath) {
  try { return await readFile(filePath, 'utf8'); } catch { return null; }
}

async function walkDirectory(dirPath, relativePath = '') {
  let entries = await readdir(dirPath, { withFileTypes: true });
  const node = { 
    type: 'directory', 
    id: relativePath.replace(/\//g, '-') || 'root', 
    name: path.basename(dirPath), 
    path: relativePath, 
    children: [] 
  };

  const groups = {};
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'README.md') continue;
    const name = entry.name.replace(/\.[^/.]+$/, "");
    if (!groups[name]) groups[name] = [];
    groups[name].push(entry);
  }

  for (const name in groups) {
    const files = groups[name];
    const mainFile = files.find(f => !f.name.endsWith('.json')) || files[0];
    const metaFile = files.find(f => f.name.endsWith('.json'));

    if (mainFile.isDirectory()) {
      const child = await walkDirectory(path.join(dirPath, mainFile.name), relativePath ? `${relativePath}/${mainFile.name}` : mainFile.name);
      node.children.push(child);
    } else {
      let meta = {};
      if (metaFile) {
        const raw = await safeReadFile(path.join(dirPath, metaFile.name));
        try { meta = JSON.parse(raw); } catch (e) {}
      }
      node.children.push({
        type: 'file',
        id: name,
        name: meta.tool || name,
        path: relativePath ? `${relativePath}/${mainFile.name}` : mainFile.name,
        description: meta.description || "Terminal utility",
        version: meta.version || "0.01",
        author: meta.author || meta.author || "Infinity"
      });
    }
  }
  return node;
}

async function main() {
  const rootNode = await walkDirectory(payloadsDir);
  const manifest = {
    generated_at: new Date().toISOString(),
    categories: rootNode.children.filter(c => c.type === 'directory'),
    tree: rootNode.children,
    index_fields: ['name', 'path', 'description']
  };
  await writeFile(outputPath, JSON.stringify(manifest, null, 2));
  console.log("[SUCCESS] Manifest paired and JSON ghosts removed.");
}
main();
