/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { toValue } from 'vue';
import type * as Misskey from 'misskey-js';

export type TmsMenuItemProps = {
	readonly id: string;
	readonly item: IMenuItem;
};

export type TmsMenuItemResolvedProps = {
	readonly id: string;
	readonly resolvedItem: IMenuItemResolved;
};

export type TmsMenuItemPendingProps = {
	readonly id: string;
};

export type TmsMenuItemResult<T extends IMenuItem> = (
	| { type: 'resolved'; resolvedItem: UnwrapLazy<T>; }
	| { type: 'pending'; }
);

type Lazy<T> = Promise<T> | (() => T | Promise<T>);

type MaybeLazy<T> = T | Lazy<T>;

type UnwrapLazy<T> = (
	T extends () => infer U
		? U extends PromiseLike<infer R>
			? R
			: U
		: T extends PromiseLike<infer U>
			? U
			: T
);

type MaybeGetter<T> = T | (() => T);

export type IMenuItem = IMenuItemResolved | IMenuItemPending;

export type IMenuItemResolved = (
	| IMenuDivider
	| IMenuLabel
	| IMenuLink
	| IMenuA
	| IMenuUser
	| IMenuSwitch
	| IMenuButton
	| IMenuRadio
	| IMenuRadioOption
	| IMenuParent
);

export type IMenuItemPending = Lazy<IMenuItemResolved>;

type ExprPrivateMenuAction = (ev: MouseEvent) => void;

export type IMenuDivider = {
	type: 'divider';
};

export type IMenuLabel = {
	type: 'label';
	text: string;
};

export type IMenuLink = {
	type: 'link';
	text: string;
	icon?: string;
	to: string;
	indicate?: MaybeGetter<boolean>;
	avatar?: Misskey.entities.User;
};

export type IMenuA = {
	type: 'a';
	text: string;
	icon?: string;
	download?: string;
	href: string;
	indicate?: MaybeGetter<boolean>;
	target?: string;
};

export type IMenuUser = {
	type: 'user';
	action: ExprPrivateMenuAction;
	active?: MaybeGetter<boolean>;
	indicate?: MaybeGetter<boolean>;
	user: Misskey.entities.User;
};

// TODO: ref直接参照からgetter/setter関数に変更
export type IMenuSwitch = {
	type: 'switch';
	text: string;
	icon?: string;
	disabled?: MaybeGetter<boolean>;
	getter: () => boolean;
	setter: (v: boolean) => void;
};

// TODO: typeがオプションなのは気に食わない
export type IMenuButton = {
	type?: 'button';
	text: string;
	icon?: string;
	action: ExprPrivateMenuAction;
	active?: MaybeGetter<boolean>;
	avatar?: Misskey.entities.User;
	danger?: MaybeGetter<boolean>;
	indicate?: MaybeGetter<boolean>;
};

// TODO: ref直接参照からgetter/setter関数に変更 (リアクティブ性を維持できる)
export type IMenuRadio<T = string | number> = {
	type: 'radio';
	text: string;
	icon?: string;
	disabled?: MaybeGetter<boolean>;
	options: Record<string, T>;
	getter: () => T;
	setter: (v: T) => void;
};

// TODO: popupMenuなどから直接定義されることはない
export type IMenuRadioOption = {
	type: 'radioOption';
	text: string;
	action: ExprPrivateMenuAction;
	active?: MaybeGetter<boolean>;
};

export type IMenuParent = {
	type: 'parent';
	text: string;
	icon?: string;
	children: MaybeLazy<IMenuItem[]>;
};

export const exprClickedAction = (item: IMenuItemResolved, event: MouseEvent, doClose = true) => {
	if (item.type == null || item.type === 'button' || item.type === 'user' || item.type === 'radioOption') {
		if (toValue(item.active)) {
			// TODO: まだ実装していない
			// if (doClose) close(false);
		} else {
			item.action(event);
			// TODO: まだ実装していない
			// if (doClose) close(true);
		}
	}
};

export const exprToggleSwitch = (item: IMenuItemResolved) => {
	if (item.type === 'switch') {
		item.setter(!item.getter());
	}
};
