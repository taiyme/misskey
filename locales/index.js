/**
 * Languages Loader
 */

import { readFileSync } from 'fs';
import { load } from 'js-yaml';

import path from 'path';
import url from 'url';

const merge = (...args) => args.reduce((a, c) => ({
	...a,
	...c,
	...Object.entries(a)
		.filter(([k]) => c && typeof c[k] === 'object')
		.reduce((a, [k, v]) => (a[k] = merge(v, c[k]), a), {})
}), {});

const languages = [
	'ar-SA',
	// 'bn-BD',
	// 'ca-ES',
	'cs-CZ',
	'da-DK',
	'de-DE',
	// 'el-GR',
	'en-US',
	'es-ES',
	'fr-FR',
	// 'hr-HR',
	// 'ht-HT',
	'id-ID',
	'it-IT',
	'ja-JP',
	'ja-KS',
	'ja-CJP',
	// 'jbo-EN',
	'kab-KAB',
	'kn-IN',
	'ko-KR',
	// 'lo-LA',
	'nl-NL',
	'no-NO',
	'pl-PL',
	'pt-PT',
	// 'ro-RO',
	'ru-RU',
	// 'si-LK',
	'sk-SK',
	// 'sv-SE',
	// 'th-TH',
	// 'tr-TR',
	'ug-CN',
	'uk-UA',
	'vi-VN',
	'zh-CN',
	'zh-TW',
];

const primaries = {
	'en': 'US',
	'ja': 'JP',
	'zh': 'CN',
};

// 何故か文字列にバックスペース文字が混入することがあり、YAMLが壊れるので取り除く
const clean = (text) => text.replace(new RegExp(String.fromCodePoint(0x08), 'g'), '');

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const locales = languages.reduce((a, c) => (a[c] = load(clean(readFileSync(`${__dirname}/${c}.yml`, 'utf-8'))) || {}, a), {});

export default Object.entries(locales)
	.reduce((a, [k, v]) => (a[k] = (() => {
		const [lang] = k.split('-');
		switch (k) {
			case 'ja-JP': return v;
			case 'ja-KS':
			case 'ja-CJP':
			case 'en-US': return merge(locales['ja-JP'], v);
			default: return merge(
				locales['ja-JP'],
				locales['en-US'],
				locales[`${lang}-${primaries[lang]}`] || {},
				v
			);
		}
	})(), a), {});
