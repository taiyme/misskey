<template>
<MkA v-if="props.url.startsWith(local)" ref="selfEl" :class="$style.root" class="ieqqeuvs _link" :to="props.url.substring(local.length)" :rel="rel" @contextmenu.stop="() => {}">
	<span v-if="pathname === '/'" :class="$style.self" class="self">{{ hostname }}</span>
	<span v-if="pathname" :class="$style.pathname" class="pathname">{{ pathname.substring(1) }}</span>
	<span v-if="query" :class="$style.query" class="query">{{ query }}</span>
	<span v-if="hash" :class="$style.hash" class="hash">{{ hash }}</span>
</MkA>
<a v-else ref="linkEl" :class="$style.root" class="ieqqeuvs _link" :href="props.url" :rel="rel ?? undefined" target="_blank" @contextmenu.stop="() => {}">
	<span v-if="schema" :class="$style.schema" class="schema">{{ schema }}//</span>
	<span v-if="hostname" :class="$style.hostname" class="hostname">{{ hostname }}</span>
	<span v-if="port" :class="$style.port" class="port">:{{ port }}</span>
	<span v-if="pathname" :class="$style.pathname" class="pathname">{{ pathname }}</span>
	<span v-if="query" :class="$style.query" class="query">{{ query }}</span>
	<span v-if="hash" :class="$style.hash" class="hash">{{ hash }}</span>
	<i :class="$style.icon" class="ti ti-external-link icon"></i>
</a>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { toUnicode as decodePunycode } from 'punycode/';
import { url as local } from '@/config';
import * as os from '@/os';
import { useTooltip } from '@/scripts/use-tooltip';
import { safeURIDecode } from '@/scripts/safe-uri-decode';
import MkA from '@/components/global/MkA.vue';

const props = withDefaults(defineProps<{
	url: string;
	rel?: null | string;
}>(), {
	rel: null,
});

const selfEl = ref<InstanceType<typeof MkA>>();
const linkEl = ref<HTMLAnchorElement>();

onMounted(() => {
	const el = ref(selfEl.value?.getAnchorElement() ?? linkEl.value ?? null);

	useTooltip(el, (showing) => {
		os.popup(defineAsyncComponent(() => import('@/components/MkUrlPreviewPopup.vue')), {
			showing,
			url: props.url,
			source: el.value,
		}, {}, 'closed');
	});
});

const url = new URL(props.url);
if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid url');

const schema = url.protocol;
const hostname = decodePunycode(url.hostname);
const port = url.port;
const pathname = safeURIDecode(url.pathname);
const query = safeURIDecode(url.search);
const hash = safeURIDecode(url.hash);
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
