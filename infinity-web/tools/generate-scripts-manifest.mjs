import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const payloadsDir = path.join(__dirname, '../assets/payloads');
const cardsDir = path.join(__dirname, 'cards');
const outputFile = path.join(payloadsDir, 'manifest.json');
const defaultCardPath = path.join(cardsDir, 'default-card.json');

// 1. Load the Default Card Configuration
let defaultCard = {};
if (fs.existsSync(defaultCardPath)) {
    try {
        defaultCard = JSON.parse(fs.readFileSync(defaultCardPath, 'utf8'));
    } catch (err) {
        console.error(`❌ Error parsing default-card.json: ${err.message}`);
    }
}

const expectedFields = ['description', 'author', 'version', 'images'];

function buildTree(dirPath, relativeBase = '') {
  const tree = [];
  try {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      if (item.startsWith('.') || item === 'manifest.json') continue;

      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      // ONLY process directories in payloads
      if (stat.isDirectory()) {
        const relativePath = relativeBase ? `${relativeBase}/${item}` : item;
        const id = item;
        const cardScriptDir = path.join(cardsDir, relativeBase, id);
        
        // Check if this dir is a "Script Folder" (has a corresponding meta folder in tools/cards)
        if (fs.existsSync(cardScriptDir) && fs.statSync(cardScriptDir).isDirectory()) {
          const fileNode = {
            ...defaultCard,
            type: 'file',
            id: id,
            name: id,
            category: relativeBase || 'General',
            modified: stat.mtime,
            links: {
                source: `assets/payloads/${relativePath}`
            }
          };

          const foundProperties = new Set();
          const propDirs = fs.readdirSync(cardScriptDir);

          propDirs.forEach(propDir => {
              const propDirPath = path.join(cardScriptDir, propDir);
              if (fs.statSync(propDirPath).isDirectory()) {
                  let propName = propDir.replace(`${id}-`, "");
                  foundProperties.add(propName);
                  
                  const innerFiles = fs.readdirSync(propDirPath);
                  
                  // Perfect marriage: Look for index.html in 'pages' folders
                  if ((propName === 'pages' || propName === 'page') && innerFiles.includes('index.html')) {
                      fileNode.pageUrl = `tools/cards/${relativePath}/${propDir}/index.html`;
                  }

                  const jsonFile = innerFiles.find(f => f.endsWith('.json'));
                  if (jsonFile) {
                      try {
                          const data = JSON.parse(fs.readFileSync(path.join(propDirPath, jsonFile), 'utf8'));
                          fileNode[propName] = (typeof data === 'object' && data[propName] !== undefined) ? data[propName] : data;
                      } catch (e) {}
                  }
              }
          });

          // Background/Thumbnail logic for UI autoscale
          if (fileNode.images && fileNode.images.length > 0) {
              fileNode.thumbnail = fileNode.images[0];
          }

          // AUDIT: Report to terminal
          const missing = expectedFields.filter(f => !foundProperties.has(f));
          if (missing.length > 0) {
              console.log(`\x1b[33m[AUDIT]\x1b[0m Script '\x1b[36m${id}\x1b[0m' in [${fileNode.category}] missing: ${missing.join(', ')}`);
          }

          tree.push(fileNode);
        } else {
          // It's a Category Branch
          tree.push({
            type: 'directory',
            name: item,
            path: relativePath,
            children: buildTree(fullPath, relativePath)
          });
        }
      }
    }
  } catch (err) {
    console.error(`Error walking ${dirPath}: ${err.message}`);
  }
  return tree;
}

console.log('🔄 Syncing Infinity Payloads with Metadata Metadata...');
const finalManifest = buildTree(payloadsDir);
fs.writeFileSync(outputFile, JSON.stringify(finalManifest, null, 2));
console.log(`\n✅ Success! Fully dynamic manifest written to ${outputFile}`);
