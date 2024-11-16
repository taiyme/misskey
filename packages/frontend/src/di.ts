/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { InjectionKey, ShallowRef } from 'vue';
import type { IRouter } from '@/nirax.js';
import type { PageMetadata, PageMetadataReceiver } from '@/scripts/page-metadata.js';

export const DI = Object.freeze({
	router: Symbol() as InjectionKey<IRouter>,
	routerFactory: Symbol() as InjectionKey<((path: string) => IRouter)>,
	routerDepth: Symbol() as InjectionKey<number>,
	pageMetadata: Symbol() as InjectionKey<Readonly<ShallowRef<PageMetadata>>>,
	pageMetadataReceiver: Symbol() as InjectionKey<PageMetadataReceiver>,
});
