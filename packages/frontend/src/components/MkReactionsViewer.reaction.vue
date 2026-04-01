<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<button
	ref="buttonEl"
	v-ripple="canToggle"
	class="_button"
	:class="[$style.root, { [$style.reacted]: myReaction == reaction, [$style.canToggle]: canToggle, [$style.small]: prefer.s.reactionsDisplaySize === 'small', [$style.large]: prefer.s.reactionsDisplaySize === 'large' }]"
	@click="toggleReaction()"
	@contextmenu.prevent.stop="menu"
>
	<MkReactionIcon :class="[$style.icon, { [$style.limitWidth]: prefer.s.limitWidthOfReaction }]" :reaction="reaction" :emojiUrl="reactionEmojis[reaction.substring(1, reaction.length - 1)]"/>
	<span :class="$style.count">{{ count }}</span>
</button>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, useTemplateRef, watch } from 'vue';
import * as Misskey from 'misskey-js';
import { getUnicodeEmojiOrNull } from '@@/js/emojilist.js';
import MkCustomEmojiDetailedDialog from './MkCustomEmojiDetailedDialog.vue';
import type { MenuItem } from '@/types/menu';
import XDetails from '@/components/MkReactionsViewer.details.vue';
import MkReactionIcon from '@/components/MkReactionIcon.vue';
import * as os from '@/os.js';
import { misskeyApi, misskeyApiGet } from '@/utility/misskey-api.js';
import { useTooltip } from '@/composables/use-tooltip.js';
import { $i } from '@/i.js';
import MkReactionEffect from '@/components/MkReactionEffect.vue';
import { i18n } from '@/i18n.js';
import * as sound from '@/utility/sound.js';
import { checkReactionPermissions } from '@/utility/check-reaction-permissions.js';
import { customEmojisMap } from '@/custom-emojis.js';
import { prefer } from '@/preferences.js';
import { DI } from '@/di.js';
import { noteEvents } from '@/composables/use-note-capture.js';
import { mute as muteEmoji, unmute as unmuteEmoji, checkMuted as isEmojiMuted } from '@/utility/emoji-mute.js';
import { haptic } from '@/utility/haptic.js';

const props = defineProps<{
	noteId: Misskey.entities.Note['id'];
	reaction: string;
	reactionEmojis: Misskey.entities.Note['reactionEmojis'];
	myReaction: Misskey.entities.Note['myReaction'];
	count: number;
	isInitial: boolean;
}>();

const mock = inject(DI.mock, false);

const emit = defineEmits<{
	(ev: 'reactionToggled', emoji: string, newCount: number): void;
}>();

const buttonEl = useTemplateRef('buttonEl');

const emojiName = computed(() => props.reaction.replace(/:/g, '').replace(/@\./, ''));

const canToggle = computed(() => {
	const emoji = customEmojisMap.get(emojiName.value) ?? getUnicodeEmojiOrNull(props.reaction);

	// TODO
	//return !props.reaction.match(/@\w/) && $i && emoji && checkReactionPermissions($i, props.note, emoji);
	return props.reaction.match(/@\w/) == null && $i != null && emoji != null;
});
const canGetInfo = computed(() => !props.reaction.match(/@\w/) && props.reaction.includes(':'));
const isLocalCustomEmoji = props.reaction[0] === ':' && props.reaction.includes('@.');

async function toggleReaction() {
	if (!canToggle.value) return;
	if ($i == null) return;

	const me = $i;

	const oldReaction = props.myReaction;
	if (oldReaction) {
		const confirm = await os.confirm({
			type: 'warning',
			text: oldReaction !== props.reaction ? i18n.ts.changeReactionConfirm : i18n.ts.cancelReactionConfirm,
		});
		if (confirm.canceled) return;

		if (oldReaction !== props.reaction) {
			sound.playMisskeySfx('reaction');
			haptic();
		}

		if (mock) {
			emit('reactionToggled', props.reaction, (props.count - 1));
			return;
		}

		misskeyApi('notes/reactions/delete', {
			noteId: props.noteId,
		}).then(() => {
			noteEvents.emit(`unreacted:${props.noteId}`, {
				userId: me.id,
				reaction: oldReaction,
			});
			if (oldReaction !== props.reaction) {
				misskeyApi('notes/reactions/create', {
					noteId: props.noteId,
					reaction: props.reaction,
				}).then(() => {
					const emoji = customEmojisMap.get(emojiName.value);
					if (emoji == null && getUnicodeEmojiOrNull(props.reaction) == null) {
						return;
					}
					noteEvents.emit(`reacted:${props.noteId}`, {
						userId: me.id,
						reaction: props.reaction,
						emoji: emoji,
					});
				});
			}
		});
	} else {
		if (prefer.s.confirmOnReact) {
			const confirm = await os.confirm({
				type: 'question',
				text: i18n.tsx.reactAreYouSure({ emoji: props.reaction.replace('@.', '') }),
			});

			if (confirm.canceled) return;
		}

		sound.playMisskeySfx('reaction');
		haptic();

		if (mock) {
			emit('reactionToggled', props.reaction, (props.count + 1));
			return;
		}

		misskeyApi('notes/reactions/create', {
			noteId: props.noteId,
			reaction: props.reaction,
		}).then(() => {
			const emoji = customEmojisMap.get(emojiName.value);
			if (emoji == null && getUnicodeEmojiOrNull(props.reaction) == null) {
				return;
			}

			noteEvents.emit(`reacted:${props.noteId}`, {
				userId: me.id,
				reaction: props.reaction,
				emoji: emoji,
			});
		});
		// TODO: 上位コンポーネントでやる
		//if (props.note.text && props.note.text.length > 100 && (Date.now() - new Date(props.note.createdAt).getTime() < 1000 * 3)) {
		//	claimAchievement('reactWithoutRead');
		//}
	}
}

async function menu(ev: PointerEvent) {
	let menuItems: MenuItem[] = [];

	if (canGetInfo.value) {
		menuItems.push({
			text: i18n.ts.info,
			icon: 'ti ti-info-circle',
			action: async () => {
				const { dispose } = os.popup(MkCustomEmojiDetailedDialog, {
					emoji: await misskeyApiGet('emoji', {
						name: props.reaction.replace(/:/g, '').replace(/@\./, ''),
					}),
				}, {
					closed: () => dispose(),
				});
			},
		});
	}

	if (isEmojiMuted(props.reaction).value) {
		menuItems.push({
			text: i18n.ts.emojiUnmute,
			icon: 'ti ti-mood-smile',
			action: () => {
				os.confirm({
					type: 'question',
					title: i18n.tsx.unmuteX({ x: isLocalCustomEmoji ? `:${emojiName.value}:` : props.reaction }),
				}).then(({ canceled }) => {
					if (canceled) return;
					unmuteEmoji(props.reaction);
				});
			},
		});
	} else {
		menuItems.push({
			text: i18n.ts.emojiMute,
			icon: 'ti ti-mood-off',
			action: () => {
				os.confirm({
					type: 'question',
					title: i18n.tsx.muteX({ x: isLocalCustomEmoji ? `:${emojiName.value}:` : props.reaction }),
				}).then(({ canceled }) => {
					if (canceled) return;
					muteEmoji(props.reaction);
				});
			},
		});
	}

	os.popupMenu(menuItems, ev.currentTarget ?? ev.target);
}

function anime() {
	if (window.document.hidden || !prefer.s.animation || buttonEl.value == null) return;

	const rect = buttonEl.value.getBoundingClientRect();
	const x = rect.left + 16;
	const y = rect.top + (buttonEl.value.offsetHeight / 2);
	const { dispose } = os.popup(MkReactionEffect, { reaction: props.reaction, x, y }, {
		end: () => dispose(),
	});
}

watch(() => props.count, (newCount, oldCount) => {
	if (oldCount < newCount) anime();
});

onMounted(() => {
	if (!props.isInitial) anime();
});

if (!mock) {
	useTooltip(buttonEl, async (showing) => {
		if (buttonEl.value == null) return;

		const reactions = await misskeyApiGet('notes/reactions', {
			noteId: props.noteId,
			type: props.reaction,
			limit: 10,
			_cacheKey_: props.count,
		});

		const users = reactions.map(x => x.user);

		const { dispose } = os.popup(XDetails, {
			showing,
			reaction: props.reaction,
			users,
			count: props.count,
			anchorElement: buttonEl.value,
		}, {
			closed: () => dispose(),
		});
	}, 100);
}
</script>

<style lang="scss" module>
.root {
	box-sizing: content-box;
	overflow: clip;
	display: inline-flex;
	height: 34px;
	margin: 2px;
	border-radius: 6px;
	align-items: center;
	justify-content: center;
	border: 1px solid rgb(from var(--MI_THEME-fg) r g b / 0.2);
	background-color: var(--MI_THEME-panel);
	color: var(--MI_THEME-fg);
	transition: border-color 0.1s ease, background-color 0.1s ease;

	&.canToggle {
		&:hover {
			border-color: rgb(from var(--MI_THEME-fg) r g b / 0.4);
			background-color: hsl(from var(--MI_THEME-panel) h s calc(l - 2));
		}
	}

	&.reacted {
		border-color: var(--MI_THEME-accent);
		background-color: var(--MI_THEME-accent);
		color: var(--MI_THEME-fgOnAccent);

		&:hover {
			border-color: hsl(from var(--MI_THEME-accent) h s calc(l + 5));
			background-color: hsl(from var(--MI_THEME-accent) h s calc(l + 5));
		}
	}

	&:not(.canToggle) {
		cursor: default;
		border-style: dashed;
	}

	&.small {
		height: 24px;
		margin: 1px;
		border-radius: 4px;

		> .icon {
			height: 24px;
			font-size: 1em;
		}

		> .count {
			padding: 0 3px;
			font-size: 0.9em;
			line-height: 24px;
		}
	}

	&.large {
		height: 44px;
		margin: 3px;
		border-radius: 8px;

		> .icon {
			height: 44px;
			font-size: 2em;
		}

		> .count {
			padding: 0 6px;
			font-size: 1.2em;
			line-height: 44px;
		}
	}
}

.limitWidth {
	max-width: 70px;
	object-fit: contain;
}

.icon {
	box-sizing: border-box;
	padding: 4px;
	height: 34px;
	font-size: 1.5em;
	background-color: #ffffff;
	pointer-events: none;
}

.count {
	box-sizing: border-box;
	padding: 0 6px;
	font-size: 0.9em;
	line-height: 34px;
}
</style>
