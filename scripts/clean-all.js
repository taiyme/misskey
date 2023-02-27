import { rmSync } from 'fs';

(async () => {
	rmSync(import.meta.url + '/../packages/backend/built', { recursive: true, force: true });
	rmSync(import.meta.url + '/../packages/backend/node_modules', { recursive: true, force: true });

	rmSync(import.meta.url + '/../packages/client/built', { recursive: true, force: true });
	rmSync(import.meta.url + '/../packages/client/node_modules', { recursive: true, force: true });

	rmSync(import.meta.url + '/../packages/sw/built', { recursive: true, force: true });
	rmSync(import.meta.url + '/../packages/sw/node_modules', { recursive: true, force: true });

	rmSync(import.meta.url + '/../built', { recursive: true, force: true });
	rmSync(import.meta.url + '/../node_modules', { recursive: true, force: true });
})();
