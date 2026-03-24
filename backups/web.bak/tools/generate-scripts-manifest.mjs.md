import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Setup paths based on canonical payload location
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const payloadsDir = path.join(webRoot, 'assets', 'payloads');
const configDir = path.join(webRoot, 'config');
const outputPath = path.join(configDir, 'scripts.json');
const searchConfigPath = path.join(configDir, 'search-config.json'); // Decoupled Search

// Helper: Safely read file
async function safeReadFile(filePath) {
    try { return await readFile(filePath, 'utf8'); } 
    catch { return null; }
}

// The core recursive walker (Answers instruction [5])
async function walkDirectory(dirPath, relativePath = '') {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    const node = {
        type: 'directory',
        id: relativePath.replace(/\//g, '-') || 'root',
        name: path.basename(dirPath),
        path: relativePath,
        readme: await safeReadFile(path.join(dirPath, 'README.md')),
        children: []
    };

    for (const entry of entries) {
        if (entry.name === 'README.md') continue; // Handled above
        
        const fullPath = path.join(dirPath, entry.name);
        const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
            node.children.push(await walkDirectory(fullPath, relPath));
        } else if (entry.isFile()) {
            node.children.push({
                type: 'file',
                id: entry.name.replace(/\.[^/.]+$/, ""), // Strip extension for ID
                name: entry.name,
                path: relPath,
                extension: path.extname(entry.name)
            });
        }
    }
    return node;
}

async function main() {
    console.log(`Starting recursive scan of canonical point: ${payloadsDir}`);
    
    // 1. Build the filesystem tree
    const tree = await walkDirectory(payloadsDir);
    
    // Level 0 directories become our "Categories"
    const categories = tree.children
        .filter(child => child.type === 'directory')
        .map(dir => ({
            id: dir.id,
            name: dir.name,
            description: dir.readme ? dir.readme.substring(0, 100) + '...' : ''
        }));

    // 2. Load dynamic search config (Answers instruction [3])
    let indexFields = ['name', 'path'];
    const searchConfig = await safeReadFile(searchConfigPath);
    if (searchConfig) {
        indexFields = JSON.parse(searchConfig).index_fields || indexFields;
    }

    // 3. Assemble Manifest
    const manifest = {
        schema_version: 2,
        generated_at: new Date().toISOString(),
        categories: categories,
        tree: tree.children, // The fully mapped infinite-depth filesystem
        index_fields: indexFields
    };

    await mkdir(configDir, { recursive: true });
    await writeFile(outputPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`SUCCESS: Wrote filesystem tree to ${outputPath}`);
}

main().catch(err => {
    console.error(`CRITICAL_ERROR: ${err.message}`);
    process.exit(1);
});
