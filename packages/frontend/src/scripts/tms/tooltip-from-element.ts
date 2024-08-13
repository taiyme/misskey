/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defineAsyncComponent, ref } from 'vue';
import { popup } from '@/os.js';
import { type TooltipProps } from '@/components/MkTooltip.vue';

export const tooltipFromElement = (props: Omit<TooltipProps, 'showing'>) => {
	const showing = ref(true);
	window.setTimeout(() => {
		showing.value = false;
	}, 3000);
	const { dispose } = popup(defineAsyncComponent(() => import('@/components/MkTooltip.vue')), {
		...props,
		showing,
	}, {
		closed: () => dispose(),
	});
};
