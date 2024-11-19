/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type * as Misskey from 'misskey-js';
import type { ComputedRef, InjectionKey } from 'vue';
import type { ParsedEmbedParams } from '@@/js/embed-page.js';
import type { MediaProxy } from '@@/js/media-proxy.js';
import type { ServerContext } from '@/server-context.js';

export const DI = Object.freeze({
	serverMetadata: Symbol() as InjectionKey<Misskey.entities.MetaDetailed>,
	embedParams: Symbol() as InjectionKey<ParsedEmbedParams>,
	serverContext: Symbol() as InjectionKey<ServerContext>,
	mediaProxy: Symbol() as InjectionKey<MediaProxy>,
	appearNote: Symbol() as InjectionKey<ComputedRef<Misskey.entities.Note>>,
});
