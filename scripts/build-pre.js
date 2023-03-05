import { mkdirSync, writeFileSync } from 'fs';
import meta from '../package.json' assert { type: "json" };
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

mkdirSync(__dirname + '/../built', { recursive: true });
writeFileSync(__dirname + '/../built/meta.json', JSON.stringify({ version: meta.version }), 'utf-8');
