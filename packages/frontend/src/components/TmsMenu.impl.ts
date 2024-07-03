/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type MaybeRefOrGetter, type Ref, computed, inject, provide, ref, toValue, unref, watch } from 'vue';
import { v4 as uuid } from 'uuid';
import { type IMenuItem } from '@/components/TmsMenuItem.impl.js';

/**
 * TmsMenuProps -- メニューの描画オプション
 */
export type TmsMenuProps = {
	readonly items: IMenuItem[];
	readonly asDrawer?: boolean | null;
	readonly align?: 'center' | string | null;
	readonly width?: number | null;
	readonly maxHeight?: number | null;
	readonly returnFocusElement?: HTMLElement | null;
};

/**
 * IMenuDefinition -- TmsMenuPropsを変形したやつ
 */
export type IMenuDefinition = {
	readonly items: {
		readonly id: string;
		readonly item: IMenuItem;
	}[];
	readonly asDrawer: boolean;
	readonly align: 'center' | string | null;
	readonly width: number | null;
	readonly maxHeight: number | null;
	readonly returnFocusElement: HTMLElement | null;
};

/**
 * provideMenuDefinition -- propsバケツリレーを防止するためにprovideする
 */
export const provideMenuDefinition = (propsRaw: MaybeRefOrGetter<TmsMenuProps>) => {
	const menuDefinitionRef = ref<IMenuDefinition | null>(null);
	watch(() => toValue(propsRaw), (newProps) => {
		menuDefinitionRef.value = parseMenuDefinition(newProps);
	}, { immediate: true });
	provide<Ref<IMenuDefinition | null>>('tmsMenuDefinitionRef', menuDefinitionRef);
};

/**
 * injectMenuDefinition - propsバケツリレーを防止するためにinjectする
 */
export const injectMenuDefinition = () => {
	const menuDefinitionRef = inject<Ref<IMenuDefinition | null>>('tmsMenuDefinitionRef');
	return computed(() => unref(menuDefinitionRef) ?? null);
};

/**
 * parseMenuDefinition -- TmsMenuPropsを変形する デフォルト値はここで
 */
const parseMenuDefinition = (props: TmsMenuProps) => {
	const items = props.items.map(item => ({ id: uuid(), item } as const));
	const asDrawer = props.asDrawer ?? false;
	const align = props.align ?? null;
	const width = props.width ?? null;
	const maxHeight = props.maxHeight ?? null;
	const returnFocusElement = props.returnFocusElement ?? null;
	return {
		items,
		asDrawer,
		align,
		width,
		maxHeight,
		returnFocusElement,
	} as const satisfies IMenuDefinition;
};
