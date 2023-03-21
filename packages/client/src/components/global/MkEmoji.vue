<template>
<img v-if="errored && useFallbackIcon" class="mk-emoji mk-emoji-fallback" src="/static-assets/emoji-unknown.png" alt="unknown" title="unknown" decoding="async"/>
<span v-else-if="errored" class="mk-emoji-fallback">{{ emoji.replace('@.', '') }}</span>
<img v-else-if="emo.type === 'custom'" class="mk-emoji custom" :class="{ normal, noStyle }" :src="emo.url" :alt="emo.alt" :title="emo.emoji" decoding="async" @error="errored = true" @load="errored = false"/>
<span v-else-if="emo.type === 'emoji' && useOsNativeEmojis" :data-emoji="emo.char" class="mk-emoji-native" :alt="emo.alt" @pointerenter="computeTitle">{{ emo.char }}</span>
<img v-else-if="emo.type === 'emoji'" :data-emoji="emo.char" class="mk-emoji" :src="emo.url" :alt="emo.alt" decoding="async" @pointerenter="computeTitle" @error="errored = true" @load="errored = false"/>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { CustomEmoji } from 'misskey-js/built/entities';
import { getStaticImageUrl } from '@/scripts/get-static-image-url';
import { char2filePath } from '@/scripts/twemoji-base';
import { defaultStore } from '@/store';
import { instance } from '@/instance';
import { getEmojiName } from '@/scripts/emojilist';

const props = withDefaults(defineProps<{
	emoji: string;
	normal?: boolean;
	noStyle?: boolean;
	customEmojis?: CustomEmoji[];
	isReaction?: boolean;
	useFallbackIcon?: boolean;
}>(), {
	customEmojis: () => instance.emojis ?? [],
});

type TypeUnknown = {
	type: 'unknown';
};
type TypeEmoji = {
	type: 'emoji';
	char: string;
	url: string;
	alt: string;
};
type TypeCustom = {
	type: 'custom';
	emoji: `:${TypeCustom['emojiName']}:`;
	emojiName: string;
	url: string;
	alt: string;
};

let errored = $ref(false);

const emo = $computed((): TypeUnknown | TypeEmoji | TypeCustom => {
	const type = props.emoji.startsWith(':') ? 'custom' : 'emoji';
	switch (type) {
		case 'emoji': {
			const char = props.emoji;
			const url = char2filePath(char);
			const alt = char;
			return { type, char, url, alt };
		}
		case 'custom': {
			const customEmoji = props.customEmojis.find(({ name }) => name === props.emoji.slice(1, -1));
			if (!customEmoji) {
				errored = true;
				return { type: 'unknown' };
			}
			const emojiName = customEmoji.name;
			const emoji: TypeCustom['emoji'] = `:${emojiName}:`;
			const url = defaultStore.state.disableShowingAnimatedImages
				? getStaticImageUrl(customEmoji.url)
				: customEmoji.url;
			const alt = customEmoji.name;
			return { type, emoji, emojiName, url, alt };
		}
		default: {
			errored = true;
			return { type: 'unknown' };
		}
	}
});

const useOsNativeEmojis = computed(() => defaultStore.state.useOsNativeEmojis && !props.isReaction);

const computeTitle = (ev: MouseEvent): void => {
	const el = ev.target;
	if (!(el instanceof HTMLElement)) return;
	const emoji = el.dataset.emoji;
	if (!emoji) return;
	el.title = emoji.startsWith(':') ? emoji : getEmojiName(emoji) ?? emoji;
};
</script>

<style lang="scss" scoped>
.mk-emoji {
	height: 1.25em;
	vertical-align: -0.25em;

	&.custom {
		height: 2em;
		vertical-align: middle;
		transition: transform 0.2s ease;

		&:hover {
			transform: scale(1.2);
		}

		&.normal {
			height: 1.25em;
			vertical-align: -0.25em;

			&:hover {
				transform: none;
			}
		}
	}

	&.noStyle {
		height: auto !important;
	}
}
</style>
