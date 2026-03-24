import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. Path Resolution
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const payloadsDir = path.join(webRoot, 'assets', 'payloads');
const configDir = path.join(webRoot, 'config');
const outputPath = path.join(configDir, 'scripts.json');
const searchConfigPath = path.join(configDir, 'search-config.json');

/**
 * Helper: Safely reads file content without crashing on missing files
 */
async function safeReadFile(filePath) {
    try {
        return await readFile(filePath, 'utf8');
    } catch {
        return null;
    }
}

/**
 * The Recursive Walker (Instruction [5])
 * Maps files and folders to infinite depth.
 */
async function walkDirectory(dirPath, relativePath = '') {
    let entries;
    try {
        entries = await readdir(dirPath, { withFileTypes: true });
    } catch (err) {
        console.warn(`[WARN] Could not read directory: ${dirPath}`);
        return null;
    }

    const node = {
        type: 'directory',
        id: relativePath.replace(/\//g, '-') || 'root',
        name: path.basename(dirPath),
        path: relativePath,
        readme: await safeReadFile(path.join(dirPath, 'README.md')),
        children: []
    };

    for (const entry of entries) {
        // Skip READMEs (handled at directory level) and hidden files
        if (entry.name === 'README.md' || entry.name.startsWith('.')) continue;

        const fullPath = path.join(dirPath, entry.name);
        const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
            const childNode = await walkDirectory(fullPath, relPath);
            if (childNode) node.children.push(childNode);
        } else if (entry.isFile()) {
            const fileStats = await stat(fullPath);
            node.children.push({
                type: 'file',
                id: entry.name.replace(/\.[^/.]+$/, "").toLowerCase(),
                name: entry.name,
                path: relPath,
                extension: path.extname(entry.name),
                size: fileStats.size,
                last_modified: fileStats.mtime.toISOString()
            });
        }
    }
    return node;
}

/**
 * Main Execution Block
 */
async function main() {
    console.log(`[INFINITY] Starting recursive scan: ${payloadsDir}`);

    // Ensure payloads directory exists
    try {
        await stat(payloadsDir);
    } catch {
        console.error(`[CRITICAL] Payloads directory not found at ${payloadsDir}. Creating it...`);
        await mkdir(payloadsDir, { recursive: true });
    }

    // 1. Build the filesystem tree
    const rootNode = await walkDirectory(payloadsDir);
    if (!rootNode) throw new Error("Failed to generate directory tree.");

    // 2. Identify Categories (Level 0 Directories)
    const categories = rootNode.children
        .filter(child => child.type === 'directory')
        .map(dir => {
            // Extract the first non-header line from README for description
            let description = '';
            if (dir.readme) {
                const lines = dir.readme.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
                description = lines[0] || '';
            }
            
            return {
                id: dir.id,
                name: dir.name,
                description: description || `Collection of ${dir.name} resources.`,
                path: dir.path
            };
        });

    // 3. Load dynamic search config (Instruction [3])
    // Default fallback if config/search-config.json is missing
    let indexFields = ['name', 'path', 'id']; 
    const searchConfigRaw = await safeReadFile(searchConfigPath);
    if (searchConfigRaw) {
        try {
            const parsed = JSON.parse(searchConfigRaw);
            if (Array.isArray(parsed.index_fields)) {
                indexFields = parsed.index_fields;
            }
        } catch (e) {
            console.warn(`[WARN] Search config malformed. Using defaults.`);
        }
    }

    // 4. Assemble Final Manifest
    const manifest = {
        schema_version: 2,
        generated_at: new Date().toISOString(),
        metadata: {
            total_categories: categories.length,
            scan_root: payloadsDir
        },
        categories: categories,
        tree: rootNode.children, // Full recursive structure
        index_fields: indexFields
    };

    // 5. Write to Disk
    await mkdir(configDir, { recursive: true });
    await writeFile(outputPath, JSON.stringify(manifest, null, 2), 'utf8');
    
    console.log(`[SUCCESS] Manifest written to ${outputPath}`);
    console.log(`[STATS] Indexed ${categories.length} categories.`);
}

main().catch(err => {
    console.error(`[CRITICAL_ERROR] ${err.message}`);
    process.exit(1);
});
