<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, { [$style.collapsed]: collapsed }]">
	<div>
		<span v-if="note.isHidden" style="opacity: 0.5">({{ i18n.ts.private }})</span>
		<span v-if="note.deletedAt" style="opacity: 0.5">({{ i18n.ts.deletedNote }})</span>
		<MkA v-if="note.replyId" :class="$style.reply" :to="`/notes/${note.replyId}`"><i class="ti ti-arrow-back-up"></i></MkA>
		<Mfm v-if="note.text" :text="note.text" :author="note.user" :nyaize="'respect'" :emojiUrls="note.emojis"/>
		<MkA v-if="note.renoteId" :class="$style.rp" :to="`/notes/${note.renoteId}`">RN: ...</MkA>
	</div>
	<details v-if="note.files && note.files.length > 0">
		<summary>({{ i18n.tsx.withNFiles({ n: note.files.length }) }})</summary>
		<MkMediaList :mediaList="note.files"/>
	</details>
	<details v-if="note.poll">
		<summary>{{ i18n.ts.poll }}</summary>
		<MkPoll :noteId="note.id" :poll="note.poll" :class="$style.poll"/>
	</details>
	<button v-if="isLong && collapsed" :class="['_button', $style.showMoreFade]" @click="collapsed = false">
		<span :class="$style.fadeLabel">{{ i18n.ts.showMore }}</span>
	</button>
	<button v-else-if="isLong && !collapsed" :class="['_button', $style.showLessFade]" @click="collapsed = true">
		<span :class="$style.fadeLabel">{{ i18n.ts.showLess }}</span>
	</button>
</div>
</template>

<script lang="ts" setup>
import { inject, ref } from 'vue';
import * as Misskey from 'misskey-js';
import { shouldCollapsed } from '@@/js/collapsed.js';
import MkMediaList from '@/components/MkMediaList.vue';
import MkPoll from '@/components/MkPoll.vue';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	note: Misskey.entities.Note;
}>();

const isLong = inject<boolean>('disableNoteCollapsed') ? false : shouldCollapsed(props.note, []);

const collapsed = ref(isLong);
</script>

<style lang="scss" module>
.root {
	overflow-wrap: break-word;
}

.collapsed {
	position: relative;
	min-height: 64px; // .showMoreFade
	max-height: 9em;
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
}

.showMoreFade {
	display: block;
	position: absolute;
	z-index: 10;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 64px; // .collapsed
	background: linear-gradient(0deg, var(--MI_THEME-panel), color(from var(--MI_THEME-panel) srgb r g b / 0));
}

.showLessFade {
	display: block;
	position: sticky;
	z-index: 10;
	bottom: var(--MI-stickyBottom, 0px);
	width: 100%;
	height: 64px;
}

.showMoreFade,
.showLessFade {
	&:hover {
		> .fadeLabel {
			background: var(--MI_THEME-panelHighlight);
		}
	}

	> .fadeLabel {
		display: inline-block;
		background: var(--MI_THEME-panel);
		padding: 6px 10px;
		font-size: 0.8em;
		border-radius: 999px;
		box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
	}
}

.reply {
	margin-right: 6px;
	color: var(--MI_THEME-accent);
}

.rp {
	margin-left: 4px;
	font-style: oblique;
	color: var(--MI_THEME-renote);
}

.poll {
	font-size: 80%;
}
</style>
