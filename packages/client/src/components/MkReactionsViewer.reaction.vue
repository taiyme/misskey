<template>
<Transition
	:enter-active-class="defaultStore.state.animation ? $style.transition_x_enterActive : ''"
	:leave-active-class="defaultStore.state.animation ? $style.transition_x_leaveActive : ''"
	:enter-from-class="defaultStore.state.animation ? $style.transition_x_enterFrom : ''"
	:leave-to-class="defaultStore.state.animation ? $style.transition_x_leaveTo : ''"
	appear
>
	<div v-if="count > 0">
		<button
			ref="buttonRef"
			class="hkzvhatu mk-reactions-viewer-reaction"
			:class="['_button', useEasyReactionsViewer ? $style.viewTypeEasy : $style.viewTypeNormal, { [$style.reacted]: note.myReaction === reaction, [$style.canToggle]: canToggle }]"
			@click="react"
		>
			<XReactionIcon :class="$style.reactionIcon" :reaction="reaction" :custom-emojis="note.emojis" use-fallback-icon/>
			<span :class="$style.reactionCount">{{ count }}</span>
		</button>
	</div>
</Transition>
</template>

<script lang="ts" setup>
import { computed, onMounted, shallowRef, watch } from 'vue';
import * as misskey from 'misskey-js';
import XDetails from '@/components/MkReactionsViewer.details.vue';
import XReactionIcon from '@/components/MkReactionIcon.vue';
import MkReactionEffect from '@/components/MkReactionEffect.vue';
import * as os from '@/os';
import { useTooltip } from '@/scripts/use-tooltip';
import { $i } from '@/account';
import { defaultStore } from '@/store';
import { tmsStore } from '@/tms/store';
import { getReactMenu, toggleReact } from '@/scripts/tms/get-react-menu';

const props = defineProps<{
	reaction: string;
	count: number;
	isInitial: boolean;
	note: misskey.entities.Note;
}>();

const useEasyReactionsViewer = computed(() => tmsStore.state.useEasyReactionsViewer);

const buttonRef = shallowRef<HTMLElement>();

const canToggle = computed(() => !props.reaction.match(/@\w/) && !!$i);

const react = (): void => {
	const param = {
		reaction: props.reaction,
		note: props.note,
		canToggle: canToggle,
		reactButton: buttonRef,
	};
	if (tmsStore.state.useReactionMenu) {
		getReactMenu(param);
	} else {
		toggleReact(param);
	}
};

const reactAnime = (): void => {
	if (document.hidden) return;
	if (!defaultStore.state.animation) return;

	const el = buttonRef.value;
	if (el) {
		const rect = el.getBoundingClientRect();
		const x = rect.left + 16;
		const y = rect.top + (el.offsetHeight / 2);
		os.popup(MkReactionEffect, {
			reaction: props.reaction,
			emojis: props.note.emojis,
			x,
			y,
			originElement: el,
		}, {}, 'end');
	}
};

watch(() => props.count, (newCount, oldCount) => {
	if (oldCount < newCount) reactAnime();
});

onMounted(() => {
	if (!props.isInitial) reactAnime();
});

useTooltip(buttonRef, async (showing) => {
	const reactions = await os.apiGet('notes/reactions', {
		noteId: props.note.id,
		type: props.reaction,
		limit: 11,
		_cacheKey_: props.count,
	});

	const users = reactions.map(x => x.user);

	os.popup(XDetails, {
		showing,
		reaction: props.reaction,
		emojis: props.note.emojis,
		users,
		count: props.count,
		targetElement: buttonRef.value,
	}, {}, 'closed');
}, 100);
</script>

<style lang="scss" module>
.transition_x_enterActive, .transition_x_leaveActive {
	transition: opacity 0.1s cubic-bezier(0, 0.5, 0.5, 1), transform 0.1s cubic-bezier(0, 0.5, 0.5, 1) !important;
}

.transition_x_enterFrom, .transition_x_leaveTo {
	opacity: 0;
	transform: scale(0.9);
}

.transition_x_leaveActive {
	position: absolute;
	visibility: hidden;
	pointer-events: none;
}

.viewTypeNormal {
	display: inline-block;
	height: 32px;
	padding: 0 6px;
	border-radius: 4px;

	&.canToggle {
		background-color: rgba(0, 0, 0, 0.05);

		&:hover {
			background-color: rgba(0, 0, 0, 0.1);
		}
	}

	&:not(.canToggle) {
		cursor: default;
	}

	&.reacted {
		background-color: var(--accent);

		&:hover {
			background-color: var(--accent);
		}

		> .reactionCount {
			color: var(--fgOnAccent);
		}

		> .reactionIcon {
			filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
		}
	}

	> .reactionCount {
		font-size: 0.9em;
		line-height: 32px;
		margin: 0 0 0 4px;
	}
}

.viewTypeEasy {
	background-color: var(--panel);
	color: var(--fgTransparentWeak);
	box-sizing: border-box;
	display: grid;
	grid-template-columns: auto auto;
	grid-template-rows: 32px;
	align-items: center;
	border-radius: 4px;
	box-shadow: 0 4px 14px -8px var(--shadow);
	overflow: hidden;

	&.canToggle {
		box-shadow: 0 4px 14px -8px var(--shadow), 0 0 0 1px var(--divider); // SEE: https://dskd.jp/archives/73.html
	}

	&.canToggle:hover,
	&.reacted {
		background-color: var(--accent);
		color: var(--fgOnAccent);
	}

	&:not(.canToggle) {
		cursor: default;
	}

	> .reactionIcon {
		background-color: #fff;
		box-sizing: border-box;
		padding: 4px;
		max-width: 100%; // はみ出し防止
		height: 32px !important; // MkEmojiのheight上書き, 100%を指定するとGeckoエンジンで描画がバグる
	}

	> .reactionCount {
		box-sizing: border-box;
		padding: 0 6px;
		font-size: 0.9em;
	}
}
</style>
