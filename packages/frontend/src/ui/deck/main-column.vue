<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<XColumn v-if="deckStore.state.alwaysShowMainColumn || mainRouter.currentRoute.value.name !== 'index'" :column="column" :isStacked="isStacked">
	<template #header>
		<template v-if="routingPageMetadataRef">
			<i :class="routingPageMetadataRef.icon"></i>
			{{ routingPageMetadataRef.title }}
		</template>
	</template>

	<div ref="contents">
		<RouterView @contextmenu.stop="onContextmenu"/>
	</div>
</XColumn>
</template>

<script lang="ts" setup>
import { provide, shallowRef } from 'vue';
import { getScrollContainer } from '@@/js/scroll.js';
import { isLink } from '@@/js/is-link.js';
import XColumn from './column.vue';
import { deckStore, Column } from '@/ui/deck/deck-store.js';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { useRoutingPageMetadata } from '@/scripts/page-metadata.js';
import { useScrollPositionManager } from '@/nirax.js';
import { mainRouter } from '@/router/main.js';
import { DI } from '@/di.js';

const { routingPageMetadataRef } = useRoutingPageMetadata();

const props = defineProps<{
	column: Column;
	isStacked: boolean;
}>();

const contents = shallowRef<HTMLElement>();

provide(DI.router, mainRouter);

/*
function back() {
	history.back();
}
*/
function onContextmenu(ev: MouseEvent) {
	if (!ev.target) return;

	if (isLink(ev.target as HTMLElement)) return;
	if (['INPUT', 'TEXTAREA', 'IMG', 'VIDEO', 'CANVAS'].includes((ev.target as HTMLElement).tagName) || (ev.target as HTMLElement).attributes['contenteditable']) return;
	if (window.getSelection()?.toString() !== '') return;
	const path = mainRouter.currentRoute.value.path;
	os.contextMenu([{
		type: 'label',
		text: path,
	}, {
		icon: 'ti ti-window-maximize',
		text: i18n.ts.openInWindow,
		action: () => {
			os.pageWindow(path);
		},
	}], ev);
}

useScrollPositionManager(() => getScrollContainer(contents.value), mainRouter);
</script>
