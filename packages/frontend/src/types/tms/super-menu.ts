/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type SuperMenuDef = SuperMenuGroup[];

export type SuperMenuGroup = {
	title?: string;
	items: SuperMenuItem[];
};

type SuperMenuItemBase = {
	icon: string;
	text: string;
	active?: boolean;
	danger?: boolean;
};

export type SuperMenuItemButton = SuperMenuItemBase & {
	type: 'button';
	action: (ev: MouseEvent) => void;
};

export type SuperMenuItemA = SuperMenuItemBase & {
	type: 'a';
	href: string;
	target: string;
};

export type SuperMenuItemLink = SuperMenuItemBase & {
	type?: 'link';
	to: string;
};

export type SuperMenuItem = SuperMenuItemButton | SuperMenuItemA | SuperMenuItemLink;
