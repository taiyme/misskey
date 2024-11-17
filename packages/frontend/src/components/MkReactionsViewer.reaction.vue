<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<button
	ref="buttonEl"
	v-ripple="canToggle"
	class="_button"
	:class="[$style.root, { [$style.reacted]: note.myReaction == reaction, [$style.canToggle]: canToggle, [$style.small]: defaultStore.state.reactionsDisplaySize === 'small', [$style.large]: defaultStore.state.reactionsDisplaySize === 'large' }]"
	@click="toggleReaction()"
	@contextmenu.prevent.stop="menu"
>
	<MkReactionIcon :class="[$style.icon, { [$style.limitWidth]: defaultStore.state.limitWidthOfReaction }]" :reaction="reaction" :emojiUrl="note.reactionEmojis[reaction.substring(1, reaction.length - 1)]"/>
	<span :class="$style.count">{{ count }}</span>
</button>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, shallowRef, watch } from 'vue';
import * as Misskey from 'misskey-js';
import { getUnicodeEmoji } from '@@/js/emojilist.js';
import MkCustomEmojiDetailedDialog from './MkCustomEmojiDetailedDialog.vue';
import XDetails from '@/components/MkReactionsViewer.details.vue';
import MkReactionIcon from '@/components/MkReactionIcon.vue';
import * as os from '@/os.js';
import { misskeyApi, misskeyApiGet } from '@/scripts/misskey-api.js';
import { useTooltip } from '@/scripts/use-tooltip.js';
import { $i } from '@/account.js';
import MkReactionEffect from '@/components/MkReactionEffect.vue';
import { claimAchievement } from '@/scripts/achievements.js';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';
import * as sound from '@/scripts/sound.js';
import { checkReactionPermissions } from '@/scripts/check-reaction-permissions.js';
import { customEmojisMap } from '@/custom-emojis.js';

const props = defineProps<{
	reaction: string;
	count: number;
	isInitial: boolean;
	note: Misskey.entities.Note;
}>();

const mock = inject<boolean>('mock', false);

const emit = defineEmits<{
	(ev: 'reactionToggled', emoji: string, newCount: number): void;
}>();

const buttonEl = shallowRef<HTMLElement>();

const emojiName = computed(() => props.reaction.replace(/:/g, '').replace(/@\./, ''));
const emoji = computed(() => customEmojisMap.get(emojiName.value) ?? getUnicodeEmoji(props.reaction));

const canToggle = computed(() => {
	return !props.reaction.match(/@\w/) && $i && emoji.value && checkReactionPermissions($i, props.note, emoji.value);
});
const canGetInfo = computed(() => !props.reaction.match(/@\w/) && props.reaction.includes(':'));

async function toggleReaction() {
	if (!canToggle.value) return;

	const oldReaction = props.note.myReaction;
	if (oldReaction) {
		const confirm = await os.confirm({
			type: 'warning',
			text: oldReaction !== props.reaction ? i18n.ts.changeReactionConfirm : i18n.ts.cancelReactionConfirm,
		});
		if (confirm.canceled) return;

		if (oldReaction !== props.reaction) {
			sound.playMisskeySfx('reaction');
		}

		if (mock) {
			emit('reactionToggled', props.reaction, (props.count - 1));
			return;
		}

		misskeyApi('notes/reactions/delete', {
			noteId: props.note.id,
		}).then(() => {
			if (oldReaction !== props.reaction) {
				misskeyApi('notes/reactions/create', {
					noteId: props.note.id,
					reaction: props.reaction,
				});
			}
		});
	} else {
		sound.playMisskeySfx('reaction');

		if (mock) {
			emit('reactionToggled', props.reaction, (props.count + 1));
			return;
		}

		misskeyApi('notes/reactions/create', {
			noteId: props.note.id,
			reaction: props.reaction,
		});
		if (props.note.text && props.note.text.length > 100 && (Date.now() - new Date(props.note.createdAt).getTime() < 1000 * 3)) {
			claimAchievement('reactWithoutRead');
		}
	}
}

async function menu(ev) {
	if (!canGetInfo.value) return;

	os.popupMenu([{
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
	}], ev.currentTarget ?? ev.target);
}

function anime() {
	if (document.hidden || !defaultStore.state.animation || buttonEl.value == null) return;

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
		const reactions = await misskeyApiGet('notes/reactions', {
			noteId: props.note.id,
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
			targetElement: buttonEl.value,
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
			background-color: hsl(from var(--MI_THEME-panel) h s calc(l - (var(--TMS-hsl-base-l) * 2)));
		}
	}

	&.reacted {
		border-color: var(--MI_THEME-accent);
		background-color: var(--MI_THEME-accent);
		color: var(--MI_THEME-fgOnAccent);

		&:hover {
			border-color: hsl(from var(--MI_THEME-accent) h s calc(l + (var(--TMS-hsl-base-l) * 5)));
			background-color: hsl(from var(--MI_THEME-accent) h s calc(l + (var(--TMS-hsl-base-l) * 5)));
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
}

.count {
	box-sizing: border-box;
	padding: 0 6px;
	font-size: 0.9em;
	line-height: 34px;
}
</style>
