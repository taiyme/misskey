/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TmsSuperMenuProps = {
	readonly def: ISuperMenuDefinitions;
	readonly wideMode?: boolean;
};

export type SuperMenuDisplayMode = 'default' | 'classic' | 'forceList';

export type ISuperMenuDefinitions = {
	readonly title?: string;
	readonly items: ISuperMenuItem[];
}[];

type ISuperMenuItem = ISuperMenuItemButton | ISuperMenuItemA | ISuperMenuItemLink;

type ISuperMenuItemBase = {
	readonly icon: string;
	readonly text: string;
	readonly active?: boolean;
	readonly danger?: boolean;
};

type ISuperMenuItemButton = ISuperMenuItemBase & {
	readonly type: 'button';
	readonly action: (ev: MouseEvent) => void;
};

type ISuperMenuItemA = ISuperMenuItemBase & {
	readonly type: 'a';
	readonly href: string;
	readonly target: string;
};

type ISuperMenuItemLink = ISuperMenuItemBase & {
	readonly type?: 'link';
	readonly to: string;
};
