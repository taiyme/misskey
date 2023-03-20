module.exports = {
	root: true,
	env: {
		"node": false
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		tsconfigRootDir: __dirname,
		ecmaVersion: 2017,
		sourceType: 'module',
		project: ['./tsconfig.eslint.json'],
	},
	extends: [
		"../shared/.eslintrc.js",
	],
	globals: {
		"require": false,
		"_DEV_": false,
		"_LANGS_": false,
		"_VERSION_": false,
		"_ENV_": false,
		"_PERF_PREFIX_": false,
	}
};
