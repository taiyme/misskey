/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// @ts-check

import { execSync } from 'node:child_process';
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

	const nodeModulesPaths = [
		path.resolve(cwd, 'packages', 'backend', 'node_modules'),
		path.resolve(cwd, 'packages', 'frontend-builder', 'node_modules'),
		path.resolve(cwd, 'packages', 'frontend-shared', 'node_modules'),
		path.resolve(cwd, 'packages', 'frontend', 'node_modules'),
		path.resolve(cwd, 'packages', 'frontend-embed', 'node_modules'),
		path.resolve(cwd, 'packages', 'icons-subsetter', 'node_modules'),
		path.resolve(cwd, 'packages', 'sw', 'node_modules'),
		path.resolve(cwd, 'packages', 'misskey-js', 'node_modules'),
		path.resolve(cwd, 'packages', 'misskey-js', 'generator', 'node_modules'),
		path.resolve(cwd, 'packages', 'misskey-reversi', 'node_modules'),
		path.resolve(cwd, 'packages', 'misskey-bubble-game', 'node_modules'),
		path.resolve(cwd, 'node_modules'),
	];

	await Promise.allSettled(
		builtPaths.map((path) => fs.rm(path, { recursive: true, force: true })),
	);

	await Promise.allSettled(
		nodeModulesPaths.map((path) => fs.rm(path, { recursive: true, force: true })),
	);

	execSync('pnpm store prune', {
		cwd,
		stdio: 'inherit',
	});
}

await main();
