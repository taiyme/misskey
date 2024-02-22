/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defineAsyncComponent, ref } from 'vue';
import { popup } from '@/os.js';

export const tooltipFromElement = (props: {
	targetElement: HTMLElement;
	text: string;
	asMfm?: boolean;
	maxWidth?: number;
	direction?: 'top' | 'bottom' | 'right' | 'left';
	primary?: boolean;
}) => {
	const showing = ref(true);
	window.setTimeout(() => {
		showing.value = false;
	}, 3000);
	popup(defineAsyncComponent(() => import('@/components/MkTooltip.vue')), {
		// @ts-expect-error
		showing,
		...props,
	}, {}, 'closed');
};
