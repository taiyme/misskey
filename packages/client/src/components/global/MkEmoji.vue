<template>
<img v-if="errored && useFallbackIcon" class="mk-emoji mk-emoji-fallback" src="/static-assets/emoji-unknown.png" alt="unknown" title="unknown" decoding="async"/>
<span v-else-if="errored" class="mk-emoji-fallback">{{ emoji.replace('@.', '') }}</span>
<img v-else-if="customEmoji" class="mk-emoji custom" :class="{ normal, noStyle }" :src="url" :alt="alt" :title="alt" decoding="async" @error="errored = true" @load="errored = false"/>
<img v-else-if="char && !useOsNativeEmojis" class="mk-emoji" :src="url" :alt="alt" decoding="async" @pointerenter="computeTitle" @error="errored = true" @load="errored = false"/>
<span v-else-if="char && useOsNativeEmojis" class="mk-emoji-native" :alt="alt" @pointerenter="computeTitle">{{ char }}</span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { CustomEmoji } from 'misskey-js/built/entities';
import { getStaticImageUrl } from '@/scripts/get-static-image-url';
import { char2filePath } from '@/scripts/twemoji-base';
import { defaultStore } from '@/store';
import { instance } from '@/instance';
import { getEmojiName } from '@/scripts/emojilist';

const props = defineProps<{
	emoji: string;
	normal?: boolean;
	noStyle?: boolean;
	customEmojis?: CustomEmoji[];
	isReaction?: boolean;
	useFallbackIcon?: boolean;
}>();

const isCustom = computed(() => props.emoji.startsWith(':'));
const char = computed(() => isCustom.value ? undefined : props.emoji);
const useOsNativeEmojis = computed(() => defaultStore.state.useOsNativeEmojis && !props.isReaction);
const ce = computed(() => props.customEmojis ?? (instance.emojis as CustomEmoji[] | undefined) ?? []);
const customEmoji = computed(() => isCustom.value ? ce.value.find(x => x.name === props.emoji.slice(1, -1)) : undefined);
const url = computed(() => {
	if (char.value) {
		return char2filePath(char.value);
	} else {
		const rawUrl = (customEmoji.value as CustomEmoji).url;
		return defaultStore.state.disableShowingAnimatedImages
			? getStaticImageUrl(rawUrl)
			: rawUrl;
	}
});
const alt = computed(() => customEmoji.value ? `:${customEmoji.value.name}:` : char.value);

let errored = $ref(!customEmoji.value && !char.value);

function computeTitle(event: PointerEvent): void {
	const title = customEmoji.value
		? `:${customEmoji.value.name}:`
		: (getEmojiName(char.value as string) ?? char.value as string);
	(event.target as HTMLElement).title = title;
}
</script>

<style lang="scss" scoped>
.mk-emoji {
	height: 1.25em;
	vertical-align: -0.25em;

	&.custom {
		height: 2.5em;
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
