import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Correctly locate the infinity-web directory regardless of execution context
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..'); 

const dataDir = path.join(webRoot, 'data', 'scripts');
const categoriesPath = path.join(webRoot, 'data', 'categories.json');
const configDir = path.join(webRoot, 'config');
const outputPath = path.join(configDir, 'scripts.json');

const INDEX_FIELDS = [
  'name',
  'title',
  'author',
  'description',
  'category',
  'shell',
  'language',
  'origin',
  'note',
  'dependencies',
  'install'
];

async function loadJson(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse JSON at ${filePath}: ${err.message}`);
  }
}

function normalizeCategory(entry) {
  if (!entry) return '';
  if (typeof entry === 'string') return entry;
  if (typeof entry === 'object') return entry.key || entry.label || '';
  return '';
}

async function main() {
  console.log(`Scanning for script definitions in: ${dataDir}`);
  
  let files;
  try {
    files = (await readdir(dataDir)).filter((name) => name.endsWith('.json')).sort();
  } catch (err) {
    throw new Error(`Could not read data directory: ${dataDir}. Check if the path exists.`);
  }

  const scripts = [];

  for (const file of files) {
    const spec = await loadJson(path.join(dataDir, file));
    const required = ['id', 'name', 'title', 'author', 'category', 'description'];

    for (const field of required) {
      if (!spec[field]) {
        console.warn(`[SKIP] Missing required field "${field}" in ${file}`);
        continue;
      }
    }

    scripts.push(spec);
  }

  let categories = [];
  try {
    const rawCategories = await loadJson(categoriesPath);
    const list = Array.isArray(rawCategories.categories) ? rawCategories.categories : [];
    categories = list.map(normalizeCategory).filter(Boolean);
  } catch {
    console.log("No categories.json found, generating from scripts...");
    categories = [];
  }

  if (!categories.length) {
    categories = Array.from(new Set(scripts.map((item) => item.category).filter(Boolean)));
  }

  const manifest = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    counts: {
      live: scripts.length,
      total: scripts.length
    },
    categories,
    scripts,
    index_fields: INDEX_FIELDS
  };

  await mkdir(configDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`SUCCESS: Wrote ${outputPath} from ${scripts.length} script spec file(s).`);
}

main().catch((error) => {
  console.error(`CRITICAL_ERROR: ${error.message}`);
  process.exit(1);
});
