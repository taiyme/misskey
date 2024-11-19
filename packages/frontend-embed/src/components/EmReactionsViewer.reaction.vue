<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<button
	class="_button"
	:class="$style.root"
>
	<EmReactionIcon :class="$style.icon" :reaction="reaction" :emojiUrl="note.reactionEmojis[reaction.substring(1, reaction.length - 1)]"/>
	<span :class="$style.count">{{ count }}</span>
</button>
</template>

<script lang="ts" setup>
import type * as Misskey from 'misskey-js';
import EmReactionIcon from '@/components/EmReactionIcon.vue';

defineProps<{
	reaction: string;
	count: number;
	note: Misskey.entities.Note;
}>();
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
	cursor: default;
}

.icon {
	box-sizing: border-box;
	padding: 4px;
	height: 34px;
	font-size: 1.5em;
	background-color: #fff;
	max-width: 70px;
	object-fit: contain;
}

.count {
	box-sizing: border-box;
	padding: 0 6px;
	font-size: 0.9em;
	line-height: 34px;
}
</style>
