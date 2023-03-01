import { build as _build } from 'esbuild';
import locales from '../../locales/index.js';
import meta from '../../package.json' assert { type: "json" };

import path from 'path';
import url from 'url';

const watch = process.argv[2]?.includes('watch');
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

console.log('Starting SW building...');

_build({
	entryPoints: [`${__dirname}/src/sw.ts`],
	bundle: true,
	format: 'esm',
	treeShaking: true,
	minify: process.env.NODE_ENV === 'production',
	absWorkingDir: __dirname,
	outbase: `${__dirname}/src`,
	outdir: `${__dirname}/../../built/_sw_dist_`,
	loader: {
		'.ts': 'ts'
	},
	tsconfig: `${__dirname}/tsconfig.json`,
	define: {
		_VERSION_: JSON.stringify(meta.version),
		_LANGS_: JSON.stringify(Object.entries(locales).map(([k, v]) => [k, v._lang_])),
		_ENV_: JSON.stringify(process.env.NODE_ENV),
		_DEV_: JSON.stringify(process.env.NODE_ENV !== 'production'),
		_PERF_PREFIX_: JSON.stringify('Misskey:'),
	},
	plugins: [{
		name: 'on-end',
		setup(build) {
			build.onEnd((result) => {
				if (result.errors) console.error('SW: watch build failed:', result.errors);
				else console.log('SW: watch build succeeded:', result);
			});
		},
	}],
}).then(result => {
	if (watch) console.log('watching...');
	else console.log('done,', JSON.stringify(result));
});
