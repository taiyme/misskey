/*
 * SPDX-FileCopyrightText: Copyright (c) 2026 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type ProjectMember = {
	name: string;
	href: string;
	iconUrl: string;
};

type ProjectPatron = {
	name: string;
};

export const projectMembers: ProjectMember[] = [
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
];

export const projectPatrons: ProjectPatron[] = [
	{ name: 'すえ' },
	{ name: 'Midra' },
	{ name: 'ゆー' },
	{ name: 'こちゅだぁほ' },
	{ name: 'xyzzy' },
	{ name: 'ふれすと' },
	{ name: 'HiSubway' },
	{ name: 'MateChan' },
	{ name: 'Yagileo' },
	{ name: 'nanasina' },
	{ name: 'すい' },
	{ name: 'ポンの助' },
	{ name: 'たまふぁいなる' },
	{ name: 'サメ' },
];
