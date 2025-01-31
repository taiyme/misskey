import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import sharedConfig from '../shared/eslint.config.js';

// eslint-disable-next-line import/no-default-export
export default [
	...sharedConfig,
	{
		ignores: [
			'built/',
			'built-test/',
			'migration/',
		],
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				parser: tsParser,
				project: [
					'./tsconfig.eslint.json',
					'./test/tsconfig.eslint.json',
					'./test-federation/tsconfig.eslint.json',
					'./test-server/tsconfig.eslint.json',
				],
				sourceType: 'module',
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'import/order': ['warn', {
				groups: [
					'builtin',
					'external',
					'internal',
					'parent',
					'sibling',
					'index',
					'object',
					'type',
				],
				pathGroups: [{
					pattern: '@/**',
					group: 'external',
					position: 'after',
				}],
			}],
			'no-restricted-globals': ['error', {
				name: '__dirname',
				message: 'Not in ESModule. Use `import.meta.url` instead.',
			}, {
				name: '__filename',
				message: 'Not in ESModule. Use `import.meta.url` instead.',
			}],
		},
	},
	{
		files: ['test/**/*.ts'],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
			},
		},
	},
	{
		files: ['test-federation/**/*.ts'],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	{
		files: ['scripts/*.{js,mjs}'],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	{
		files: ['src/server/web/*.js'],
		languageOptions: {
			globals: {
				...Object.fromEntries(Object.entries(globals.node).map(([key]) => [key, 'off'])),
				...globals.browser,
			},
		},
	},
];
