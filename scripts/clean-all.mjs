/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('..', import.meta.url));

async function main() {
	await fs.rm(resolve(cwd, 'packages', 'misskey-bubble-game', 'built'), { recursive: true, force: true });
	await fs.rm(resolve(cwd, 'packages', 'misskey-bubble-game', 'node_modules'), { recursive: true, force: true });

	await fs.rm(resolve(cwd, 'packages', 'misskey-reversi', 'built'), { recursive: true, force: true });
	await fs.rm(resolve(cwd, 'packages', 'misskey-reversi', 'node_modules'), { recursive: true, force: true });

	await fs.rm(resolve(cwd, 'packages', 'misskey-js', 'built'), { recursive: true, force: true });
	await fs.rm(resolve(cwd, 'packages', 'misskey-js', 'node_modules'), { recursive: true, force: true });

	await fs.rm(resolve(cwd, 'packages', 'misskey-js', 'generator', 'built'), { recursive: true, force: true });
	await fs.rm(resolve(cwd, 'packages', 'misskey-js', 'generator', 'node_modules'), { recursive: true, force: true });

	await fs.rm(resolve(cwd, 'packages', 'backend', 'built'), { recursive: true, force: true });
	await fs.rm(resolve(cwd, 'packages', 'backend', 'built-test'), { recursive: true, force: true });
	await fs.rm(resolve(cwd, 'packages', 'backend', 'node_modules'), { recursive: true, force: true });

	await fs.rm(resolve(cwd, 'packages', 'frontend-shared', 'js-built'), { recursive: true, force: true });
	await fs.rm(resolve(cwd, 'packages', 'frontend-shared', 'node_modules'), { recursive: true, force: true });

	await fs.rm(resolve(cwd, 'packages', 'frontend', 'node_modules'), { recursive: true, force: true });

	await fs.rm(resolve(cwd, 'packages', 'frontend-embed', 'node_modules'), { recursive: true, force: true });

	await fs.rm(resolve(cwd, 'packages', 'sw', 'node_modules'), { recursive: true, force: true });

	await fs.rm(resolve(cwd, 'built'), { recursive: true, force: true });
	await fs.rm(resolve(cwd, 'node_modules'), { recursive: true, force: true });

	execSync('pnpm store prune', { cwd, stdio: 'inherit' });
}

await main();
