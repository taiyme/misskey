import { mkdirSync, writeFileSync } from 'fs';
import * as meta from '../package.json' assert { type: "json" };

mkdirSync(import.meta.url + '/../built', { recursive: true });
writeFileSync(import.meta.url + '/../built/meta.json', JSON.stringify({ version: meta.version }), 'utf-8');
