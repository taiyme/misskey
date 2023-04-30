<template>
<MkWindow
	:initial-width="640"
	:initial-height="402"
	:can-resize="true"
	:close-button="true"
>
	<template #header>
		<i class="icon ti ti-brand-youtube" style="margin-right: 0.5em;"></i>
		<span>{{ title ?? 'YouTube' }}</span>
	</template>

	<div class="poamfof" :class="$style.root">
		<Transition :name="defaultStore.state.animation ? 'fade' : ''" mode="out-in">
			<div v-if="player.url && (player.url.startsWith('http://') || player.url.startsWith('https://'))" class="player" :class="$style.player">
				<iframe
					v-if="!fetching"
					:class="$style.iframe"
					:src="player.url + (player.url.match(/\?/) ? '&autoplay=1&auto_play=1' : '?autoplay=1&auto_play=1')"
					frameborder="0"
					allow="autoplay; encrypted-media"
					allowfullscreen
				/>
			</div>
			<span v-else>invalid url</span>
		</Transition>
		<MkLoading v-if="fetching"/>
		<MkError v-else-if="!player.url" @retry="ytFetch()"/>
	</div>
</MkWindow>
</template>

<script lang="ts" setup>
import type { summaly } from 'summaly';
import MkWindow from '@/components/MkWindow.vue';
import { defaultStore } from '@/store';
import { versatileLang } from '@/scripts/intl-const';

type SummalyResult = Awaited<ReturnType<typeof summaly>>;

const props = defineProps<{
	url: string;
}>();

const requestUrl = new URL(props.url);
if (!['http:', 'https:'].includes(requestUrl.protocol)) throw new Error('invalid url');

let fetching = $ref(true);
let title = $ref<string | null>(null);
let player = $ref<SummalyResult['player']>({
	url: null,
	width: null,
	height: null,
	allow: [],
});

const ytFetch = (): void => {
	fetching = true;
	window.fetch(`/url?url=${encodeURIComponent(requestUrl.href)}&lang=${versatileLang}`).then(res => {
		if (!res.ok) {
			title = null;
			fetching = false;
			player = {
				url: null,
				width: null,
				height: null,
				allow: [],
			};
			return;
		}
		res.json().then((info: SummalyResult) => {
			title = info.title;
			fetching = false;
			// Playerが空になる/欠落することがあるためデフォルト値を設定する
			player = {
				...{ url: null, width: null, height: null, allow: [] },
				...info.player,
			};
		});
	});
};

ytFetch();
</script>

<style lang="scss" module>
.root {
	position: relative;
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
	height: 100%;
}

.player {
	position: absolute;
	inset: 0;
}

.iframe {
	width: 100%;
	height: 100%;
}
</style>
