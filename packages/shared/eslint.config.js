import globals from 'globals';
import pluginMisskey from '@misskey-dev/eslint-plugin';
import stylisticJs from '@stylistic/eslint-plugin-js';
import stylisticTs from '@stylistic/eslint-plugin-ts';

/**
 * @param {'warn' | 'error' | 'off'} severity
 * @param {import('eslint').Linter.RuleEntry} ruleEntry
 * @returns {import('eslint').Linter.RuleEntry}
 */
function overrideSeverity(severity, ruleEntry) {
	if (ruleEntry === severity) return ruleEntry;
	if (typeof ruleEntry === 'string' || typeof ruleEntry === 'number') return severity;
	return [severity, ...ruleEntry.slice(1)];
}

const legacyToStylisticRules = {
	...stylisticJs.configs['disable-legacy'].rules,
	...stylisticTs.configs['disable-legacy'].rules,
	// '@stylistic/ts/indent': overrideSeverity('warn', pluginMisskey.configs.javascript.rules.indent),
	indent: overrideSeverity('warn', pluginMisskey.configs.javascript.rules.indent),
	'@stylistic/js/eol-last': overrideSeverity('error', pluginMisskey.configs.javascript.rules['eol-last']),
	'@stylistic/ts/semi': overrideSeverity('error', pluginMisskey.configs.javascript.rules.semi),
	'@stylistic/js/semi-spacing': overrideSeverity('warn', pluginMisskey.configs.javascript.rules['semi-spacing']),
	'@stylistic/ts/quotes': overrideSeverity('warn', pluginMisskey.configs.javascript.rules.quotes),
	'@stylistic/ts/comma-dangle': overrideSeverity('error', pluginMisskey.configs.javascript.rules['comma-dangle']),
	'@stylistic/ts/comma-spacing': overrideSeverity('warn', pluginMisskey.configs.javascript.rules['comma-spacing']),
	'@stylistic/js/array-bracket-spacing': overrideSeverity('warn', pluginMisskey.configs.javascript.rules['array-bracket-spacing']),
	'@stylistic/ts/keyword-spacing': overrideSeverity('warn', pluginMisskey.configs.javascript.rules['keyword-spacing']),
	'@stylistic/ts/key-spacing': overrideSeverity('warn', pluginMisskey.configs.javascript.rules['key-spacing']),
	'@stylistic/js/arrow-spacing': overrideSeverity('warn', pluginMisskey.configs.javascript.rules['arrow-spacing']),
	'@stylistic/ts/brace-style': overrideSeverity('error', pluginMisskey.configs.javascript.rules['brace-style']),
	'@stylistic/js/padded-blocks': overrideSeverity('warn', pluginMisskey.configs.javascript.rules['padded-blocks']),
	'@stylistic/js/no-multi-spaces': overrideSeverity('warn', pluginMisskey.configs.javascript.rules['no-multi-spaces']),
	'@stylistic/js/no-multiple-empty-lines': overrideSeverity('warn', pluginMisskey.configs.javascript.rules['no-multiple-empty-lines']),
	'@stylistic/js/nonblock-statement-body-position': overrideSeverity('error', pluginMisskey.configs.javascript.rules['nonblock-statement-body-position']),
	'@stylistic/ts/object-curly-spacing': overrideSeverity('warn', pluginMisskey.configs.javascript.rules['object-curly-spacing']),
	'@stylistic/ts/space-infix-ops': overrideSeverity('warn', pluginMisskey.configs.javascript.rules['space-infix-ops']),
	'@stylistic/ts/space-before-blocks': overrideSeverity('warn', pluginMisskey.configs.javascript.rules['space-before-blocks']),
	'@stylistic/ts/padding-line-between-statements': [
		...overrideSeverity('warn', pluginMisskey.configs.javascript.rules['padding-line-between-statements']),
		{ blankLine: 'never', prev: 'function-overload', next: 'function' },
	],
	'@stylistic/ts/lines-between-class-members': overrideSeverity('off', pluginMisskey.configs.javascript.rules['lines-between-class-members']),
	'@stylistic/ts/function-call-spacing': overrideSeverity('error', pluginMisskey.configs.typescript.rules['@typescript-eslint/func-call-spacing']),
};

// eslint-disable-next-line import/no-default-export
export default [
	...pluginMisskey.configs.recommended,
	{
		files: ['**/*.cjs'],
		languageOptions: {
			sourceType: 'commonjs',
			parserOptions: {
				sourceType: 'commonjs',
			},
		},
	},
	{
		files: ['**/*.js', '**/*.jsx'],
		languageOptions: {
			parserOptions: {
				sourceType: 'module',
			},
		},
	},
	{
		files: ['build.js'],
		languageOptions: {
			globals: globals.node,
		},
	},
	{
		files: ['**/*.js', '**/*.cjs'],
		rules: {
			'@typescript-eslint/no-var-requires': 'off',
		},
	},
	{
		rules: {
			'no-restricted-imports': ['error', {
				paths: [{ name: 'punycode' }],
			}],
		},
	},
	//#region Stylistic
	/** @see https://github.com/taiyme/eslint-config/blob/main/src/configs/typescript.ts */
	{
		plugins: {
			'@stylistic/js': stylisticJs,
			'@stylistic/ts': stylisticTs,
		},
		rules: {
			...legacyToStylisticRules,
			'one-var': ['warn', 'never'],
			'@stylistic/js/array-bracket-newline': ['warn', 'consistent'],
			'@stylistic/js/array-element-newline': 'off',
			'@stylistic/js/comma-style': ['error', 'last'],
			'@stylistic/js/computed-property-spacing': ['warn', 'never'],
			'@stylistic/js/dot-location': ['warn', 'property'],
			'@stylistic/js/generator-star-spacing': ['warn', {
				before: true,
				after: true,
				named: 'after',
				anonymous: 'neither',
				method: 'both',
			}],
			'@stylistic/js/jsx-quotes': ['warn', 'prefer-single'],
			'@stylistic/js/linebreak-style': ['error', 'unix'],
			'@stylistic/js/new-parens': ['error', 'always'],
			'@stylistic/js/no-floating-decimal': 'error',
			'@stylistic/js/no-mixed-operators': 'error',
			'@stylistic/js/no-mixed-spaces-and-tabs': 'error',
			'@stylistic/js/no-trailing-spaces': 'warn',
			'@stylistic/js/no-whitespace-before-property': 'warn',
			'@stylistic/js/one-var-declaration-per-line': ['warn', 'always'],
			'@stylistic/js/rest-spread-spacing': ['warn', 'never'],
			'@stylistic/js/semi-style': ['error', 'last'],
			'@stylistic/js/space-in-parens': ['warn', 'never'],
			'@stylistic/js/space-unary-ops': 'warn',
			'@stylistic/js/switch-colon-spacing': ['warn', {
				before: false,
				after: true,
			}],
			'@stylistic/js/template-curly-spacing': ['warn', 'never'],
			'@stylistic/js/template-tag-spacing': ['error', 'never'],
			'@stylistic/js/wrap-iife': ['error', 'inside', {
				functionPrototypeMethods: true,
			}],
			'@stylistic/js/wrap-regex': 'warn',
			'@stylistic/js/yield-star-spacing': ['warn', {
				before: false,
				after: true,
			}],
			'@stylistic/ts/block-spacing': ['warn', 'always'],
			'@stylistic/ts/member-delimiter-style': ['warn', {
				multiline: {
					delimiter: 'semi',
					requireLast: true,
				},
				singleline: {
					delimiter: 'semi',
					requireLast: true,
				},
				multilineDetection: 'brackets',
			}],
			'@stylistic/ts/no-extra-semi': 'error',
			'@stylistic/ts/object-curly-newline': ['warn', {
				multiline: true,
				consistent: true,
			}],
			'@stylistic/ts/quote-props': ['warn', 'as-needed'],
			'@stylistic/ts/space-before-function-paren': ['warn', {
				anonymous: 'never',
				named: 'never',
				asyncArrow: 'always',
			}],
			'@stylistic/ts/type-annotation-spacing': ['warn', {
				before: false,
				after: true,
				overrides: {
					arrow: {
						before: true,
						after: true,
					},
				},
			}],
		},
	},
	//#endregion Stylistic
];
