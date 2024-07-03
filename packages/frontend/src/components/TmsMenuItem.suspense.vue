<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<slot v-if="result.type === 'resolved'" name="resolved" :resolvedItem="result.resolvedItem"></slot>
<slot v-else name="pending"></slot>
</template>

<script lang="ts" setup generic="T extends IMenuItem">
import { shallowRef, watch } from 'vue';
import { type IMenuItem, type TmsMenuItemResult } from '@/components/TmsMenuItem.impl.js';

const props = defineProps<{
	item: T;
}>();

type Result = TmsMenuItemResult<T>;

const result = shallowRef<Result>({ type: 'pending' });

watch(() => props.item, (itemRaw) => {
	const item = typeof itemRaw === 'function' ? itemRaw() : itemRaw;
	if ('then' in item) {
		result.value = { type: 'pending' };
		item.then(resolvedItem => {
			result.value = { type: 'resolved', resolvedItem } as Result;
		}).catch(() => {
			result.value = { type: 'pending' };
		});
	} else {
		result.value = { type: 'resolved', resolvedItem: item } as Result;
	}
}, { immediate: true });
</script>
