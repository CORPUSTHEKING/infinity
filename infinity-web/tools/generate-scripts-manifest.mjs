import fs from 'fs';
import path from 'path';

const SCRIPT_ROOT = '../../pool/main';
const OUTPUT_PATH = '../config/scripts.json';

function scan() {
    const scripts = [];
    if (!fs.existsSync(SCRIPT_ROOT)) return scripts;

    const dirs = fs.readdirSync(SCRIPT_ROOT);
    dirs.forEach(dir => {
        const fullPath = path.join(SCRIPT_ROOT, dir);
        if (fs.statSync(fullPath).isDirectory()) {
            const files = fs.readdirSync(fullPath);
            files.forEach(file => {
                scripts.push({
                    id: Buffer.from(file).toString('base64').substring(0, 8),
                    title: file,
                    category: dir,
                    path: `pool/main/${dir}/${file}`,
                    timestamp: new Date().toISOString()
                });
            });
        }
    });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(scripts, null, 4));
    console.log(`Manifest updated: ${scripts.length} scripts found.`);
}

scan();
