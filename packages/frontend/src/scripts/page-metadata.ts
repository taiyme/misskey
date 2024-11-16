/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type MaybeRefOrGetter, inject, onActivated, onDeactivated, onMounted, onUnmounted, provide, ref, shallowReadonly, shallowRef, toValue, watch } from 'vue';
import type * as Misskey from 'misskey-js';
import { DI } from '@/di.js';

export type PageMetadata = {
	readonly title: string;
	readonly subtitle?: string | null;
	readonly icon?: string | null;
	readonly needWideArea?: boolean;
	readonly withUserAvatar?: Misskey.entities.User | null;
	readonly withUserName?: Misskey.entities.User | null;
};

export type PageMetadataReceiver = ((pageMetadata: PageMetadata) => void);

export function definePageMetadata(maybeRefOrGetterPageMetadata: MaybeRefOrGetter<PageMetadata>) {
	const pageActiveRef = ref(false);
	onMounted(() => pageActiveRef.value = true);
	onActivated(() => pageActiveRef.value = true);
	onUnmounted(() => pageActiveRef.value = false);
	onDeactivated(() => pageActiveRef.value = false);

	const receiver = inject(DI.pageMetadataReceiver);

	const pageMetadataRef = shallowRef(toValue(maybeRefOrGetterPageMetadata));
	provide(DI.pageMetadata, shallowReadonly(pageMetadataRef));
	receiver?.(pageMetadataRef.value);

	watch(() => toValue(maybeRefOrGetterPageMetadata), (pageMetadata) => {
		pageMetadataRef.value = pageMetadata;
		if (pageActiveRef.value) {
			receiver?.(pageMetadataRef.value);
		}
	}, { deep: true });

	watch(pageActiveRef, (to, from) => {
		if (to && !from) {
			receiver?.(pageMetadataRef.value);
		}
	});
}

export function useRoutingPageMetadata() {
	const routingPageMetadataRef = shallowRef<PageMetadata | null>(null);
	provide(DI.pageMetadataReceiver, (pageMetadata) => {
		routingPageMetadataRef.value = pageMetadata;
	});
	return {
		routingPageMetadataRef: shallowReadonly(routingPageMetadataRef),
	} as const;
}
