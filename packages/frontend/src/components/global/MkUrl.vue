<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkA v-if="props.url.startsWith(local)" ref="selfEl" :class="[$style.root, '_link']" :to="props.url.substring(local.length)" :rel="rel" @contextmenu.stop="() => {}">
	<span v-if="pathname === '/'" :class="$style.self">{{ hostname }}</span>
	<span v-if="pathname" :class="$style.pathname">{{ pathname.slice(1) }}</span>
	<span v-if="query" :class="$style.query">{{ query }}</span>
	<span v-if="hash" :class="$style.hash">{{ hash }}</span>
</MkA>
<a v-else ref="linkEl" :class="[$style.root, '_link']" :href="props.url" :rel="rel ?? undefined" target="_blank" @contextmenu.stop="() => {}">
	<span v-if="schema" :class="$style.schema">{{ schema }}//</span>
	<span v-if="hostname" :class="$style.hostname">{{ hostname }}</span>
	<span v-if="port" :class="$style.port">:{{ port }}</span>
	<span v-if="pathname" :class="$style.pathname">{{ pathname }}</span>
	<span v-if="query" :class="$style.query">{{ query }}</span>
	<span v-if="hash" :class="$style.hash">{{ hash }}</span>
	<i :class="$style.icon" class="ti ti-external-link"></i>
</a>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, shallowRef } from 'vue';
import { toUnicode as decodePunycode } from 'punycode/';
import { url as local } from '@/config.js';
import * as os from '@/os.js';
import { useTooltip } from '@/scripts/use-tooltip.js';
import { safeURIDecode } from '@/scripts/safe-uri-decode.js';
import MkA from '@/components/global/MkA.vue';

const props = withDefaults(defineProps<{
	url: string;
	rel?: null | string;
}>(), {
	rel: null,
});

const selfEl = shallowRef<InstanceType<typeof MkA>>();
const linkEl = shallowRef<HTMLAnchorElement>();

const el = computed(() => selfEl.value?.getAnchorElement() ?? linkEl.value ?? null);

const url = new URL(props.url);
if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid url');

const schema = url.protocol;
const hostname = decodePunycode(url.hostname);
const port = url.port;
const pathname = safeURIDecode(url.pathname);
const query = safeURIDecode(url.search);
const hash = safeURIDecode(url.hash);

useTooltip(el, (showing) => {
	os.popup(defineAsyncComponent(() => import('@/components/MkUrlPreviewPopup.vue')), {
		showing,
		url: props.url,
		source: el.value,
	}, {}, 'closed');
});
</script>

<style lang="scss" module>
.root {
	word-break: break-all;
}

.icon {
	padding-left: 2px;
	font-size: 0.9em;
}

.self {
	font-weight: bold;
}

.schema {
	opacity: 0.5;
}

.hostname {
	font-weight: bold;
}

.pathname {
	opacity: 0.8;
}

.query {
	opacity: 0.5;
}

.hash {
	font-style: italic;
}
</style>
