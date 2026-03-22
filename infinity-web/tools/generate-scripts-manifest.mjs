import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'data', 'scripts');
const categoriesPath = path.join(root, 'data', 'categories.json');
const configDir = path.join(root, 'config');
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
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function normalizeCategory(entry) {
  if (!entry) return '';
  if (typeof entry === 'string') return entry;
  if (typeof entry === 'object') return entry.key || entry.label || '';
  return '';
}

async function main() {
  const files = (await readdir(dataDir)).filter((name) => name.endsWith('.json')).sort();
  const scripts = [];

  for (const file of files) {
    const spec = await loadJson(path.join(dataDir, file));
    const required = ['id', 'name', 'title', 'author', 'category', 'description'];

    for (const field of required) {
      if (!spec[field]) {
        throw new Error(`Missing required field "${field}" in ${file}`);
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
    categories = [];
  }

  if (!categories.length) {
    categories = Array.from(new Set(scripts.map((item) => item.category).filter(Boolean)));
  }

  const manifest = {
    schema_version: 1,
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
  console.log(`Wrote ${outputPath} from ${scripts.length} script spec file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
