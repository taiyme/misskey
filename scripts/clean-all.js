import { rmSync } from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

(async () => {
	rmSync(__dirname + '/../packages/backend/built', { recursive: true, force: true });
	rmSync(__dirname + '/../packages/backend/node_modules', { recursive: true, force: true });

	rmSync(__dirname + '/../packages/client/built', { recursive: true, force: true });
	rmSync(__dirname + '/../packages/client/node_modules', { recursive: true, force: true });

	rmSync(__dirname + '/../packages/sw/built', { recursive: true, force: true });
	rmSync(__dirname + '/../packages/sw/node_modules', { recursive: true, force: true });

	rmSync(__dirname + '/../built', { recursive: true, force: true });
	rmSync(__dirname + '/../node_modules', { recursive: true, force: true });
})();
