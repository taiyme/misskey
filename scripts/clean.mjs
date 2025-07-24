/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// @ts-check

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function main() {
	const cwd = fileURLToPath(new URL('..', import.meta.url));

	const builtPaths = [
		path.resolve(cwd, 'packages', 'backend', 'built'),
		path.resolve(cwd, 'packages', 'backend', 'built-test'),
		path.resolve(cwd, 'packages', 'frontend-shared', 'js-built'),
		path.resolve(cwd, 'packages', 'icons-subsetter', 'built'),
		path.resolve(cwd, 'packages', 'misskey-js', 'built'),
		path.resolve(cwd, 'packages', 'misskey-js', 'generator', 'built'),
		path.resolve(cwd, 'packages', 'misskey-reversi', 'built'),
		path.resolve(cwd, 'packages', 'misskey-bubble-game', 'built'),
		path.resolve(cwd, 'built'),
	];

	await Promise.allSettled(
		builtPaths.map((path) => fs.rm(path, { recursive: true, force: true })),
	);
}

await main();
