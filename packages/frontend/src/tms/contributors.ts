/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type Contributor = {
	readonly name: string;
	readonly href: string;
	readonly iconUrl: string;
};

export type Patron = string;

export const projectMembers = [
	{
		name: '@taiyme',
		href: 'https://github.com/taiyme',
		iconUrl: 'https://avatars.githubusercontent.com/u/53635909?v=4',
	},
	{
		name: '@cffnpwr',
		href: 'https://github.com/cffnpwr',
		iconUrl: 'https://avatars.githubusercontent.com/u/86540016?v=4',
	},
	{
		name: '@souhait0614',
		href: 'https://github.com/souhait0614',
		iconUrl: 'https://avatars.githubusercontent.com/u/62732828?v=4',
	},
] satisfies Contributor[] as Contributor[];

export const contributors = [
] satisfies Contributor[] as Contributor[];

export const patrons = [
	'すえ',
	'Midra',
	'ゆー',
	'こちゅだぁほ',
	'xyzzy',
	'ふれすと',
	'HiSubway',
	'MateChan',
	'Yagileo',
	'nanasina',
	'すい',
	'ポンの助',
	'たまふぁいなる',
] satisfies Patron[] as Patron[];
