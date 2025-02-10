import tsParser from '@typescript-eslint/parser';
import sharedConfig from '../shared/eslint.config.js';

// eslint-disable-next-line import/no-default-export
export default [
	...sharedConfig,
	{
		ignores: [
			'built/',
		],
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				parser: tsParser,
				project: [
					'./tsconfig.eslint.json',
				],
				sourceType: 'module',
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
];
