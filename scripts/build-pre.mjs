/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as fs from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const packageJsonPath = resolve(cwd, 'package.json');

async function build() {
	try {
		const json = await fs.readFile(packageJsonPath, 'utf-8');
		const meta = JSON.parse(json);
		await fs.mkdir(resolve(cwd, 'built'), { recursive: true });
		await fs.writeFile(resolve(cwd, 'built', 'meta.json'), JSON.stringify({ version: meta.version }), 'utf-8');
	} catch (err) {
		console.log(err);
	}
}

await build();

if (process.argv.includes('--watch')) {
	const watcher = fs.watch(packageJsonPath);
	for await (const event of watcher) {
		const filename = event.filename?.replaceAll('\\', '/');
		console.log(`update ${filename} ...`);
		await build();
	}
}
