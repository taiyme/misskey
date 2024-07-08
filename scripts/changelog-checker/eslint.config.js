import tsParser from '@typescript-eslint/parser';
import sharedConfig from '../../packages/shared/eslint.config.js';

// eslint-disable-next-line import/no-default-export
export default [
	...sharedConfig,
	{
		files: ['src/**/*.ts', 'src/**/*.tsx'],
		languageOptions: {
			parserOptions: {
				parser: tsParser,
				project: ['./tsconfig.json'],
				sourceType: 'module',
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
];
