<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	:class="$style.root"
>
	<EmNoteSub v-if="appearNote.reply" :note="appearNote.reply" :class="$style.replyTo"/>
	<div v-if="pinned" :class="$style.tip"><i class="ti ti-pin"></i> {{ i18n.ts.pinnedNote }}</div>
	<!--<div v-if="appearNote._prId_" class="tip"><i class="ti ti-speakerphone"></i> {{ i18n.ts.promotion }}<button class="_textButton hide" @click="readPromo()">{{ i18n.ts.hideThisNote }} <i class="ti ti-x"></i></button></div>-->
	<!--<div v-if="appearNote._featuredId_" class="tip"><i class="ti ti-bolt"></i> {{ i18n.ts.featured }}</div>-->
	<div v-if="isRenoted" :class="$style.renote">
		<EmAvatar :class="$style.renoteAvatar" :user="note.user" link/>
		<i class="ti ti-repeat" style="margin-right: 4px;"></i>
		<I18n :src="i18n.ts.renotedBy" tag="span" :class="$style.renoteText">
			<template #user>
				<EmA :class="$style.renoteUserName" :to="userPage(note.user)">
					<EmUserName :user="note.user"/>
				</EmA>
			</template>
		</I18n>
		<div :class="$style.renoteInfo">
			<span :class="$style.renoteTime" class="_button">
				<EmTime :time="note.createdAt"/>
			</span>
			<span v-if="note.visibility !== 'public'" style="margin-left: 0.5em;" :title="i18n.ts._visibility[note.visibility]">
				<i v-if="note.visibility === 'home'" class="ti ti-home"></i>
				<i v-else-if="note.visibility === 'followers'" class="ti ti-lock"></i>
				<i v-else-if="note.visibility === 'specified'" class="ti ti-mail"></i>
			</span>
			<span v-if="note.localOnly" style="margin-left: 0.5em;" :title="i18n.ts._visibility['disableFederation']"><i class="ti ti-rocket-off"></i></span>
			<span v-if="note.channel" style="margin-left: 0.5em;" :title="note.channel.name"><i class="ti ti-device-tv"></i></span>
		</div>
	</div>
	<article :class="$style.article">
		<EmAvatar :class="$style.avatar" :user="appearNote.user" link/>
		<div :class="$style.main">
			<EmNoteHeader :note="appearNote" :mini="true"/>
			<EmInstanceTicker v-if="showTicker" :instance="appearNote.user.instance" :channel="appearNote.channel"/>
			<div style="container-type: inline-size;">
				<p v-if="appearNote.cw != null" :class="$style.cw">
					<EmMfm
						v-if="appearNote.cw !== ''"
						:text="appearNote.cw"
						:author="appearNote.user"
						:nyaize="'respect'"
					/>
					<button style="display: block; width: 100%; margin: 4px 0;" class="_buttonGray _buttonRounded" @click="showContent = !showContent">{{ showContent ? i18n.ts._cw.hide : i18n.ts._cw.show }}</button>
				</p>
				<div v-show="appearNote.cw == null || showContent" :class="[{ [$style.contentCollapsed]: collapsed }]">
					<div :class="$style.text">
						<span v-if="appearNote.isHidden" style="opacity: 0.5;">({{ i18n.ts.private }})</span>
						<EmA v-if="appearNote.replyId" :class="$style.replyIcon" :to="notePage(appearNote.replyId)"><i class="ti ti-arrow-back-up"></i></EmA>
						<EmMfm
							v-if="appearNote.text"
							:parsedNodes="parsed"
							:text="appearNote.text"
							:author="appearNote.user"
							:nyaize="'respect'"
							:emojiUrls="appearNote.emojis"
						/>
					</div>
					<div v-if="appearNote.files && appearNote.files.length > 0">
						<EmMediaList :mediaList="appearNote.files"/>
					</div>
					<EmPoll v-if="appearNote.poll" :noteId="appearNote.id" :poll="appearNote.poll" :class="$style.poll"/>
					<div v-if="appearNote.renote" :class="$style.quote"><EmNoteSimple :note="appearNote.renote" :class="$style.quoteNote"/></div>
					<button v-if="isLong && collapsed" :class="['_button', $style.showMoreFade]" @click="collapsed = false">
						<span :class="$style.fadeLabel">{{ i18n.ts.showMore }}</span>
					</button>
					<button v-else-if="isLong && !collapsed" :class="['_button', $style.showLessFade]" @click="collapsed = true">
						<span :class="$style.fadeLabel">{{ i18n.ts.showLess }}</span>
					</button>
				</div>
				<EmA v-if="appearNote.channel && !inChannel" :class="$style.channel" :to="`${url}/channels/${appearNote.channel.id}`"><i class="ti ti-device-tv"></i> {{ appearNote.channel.name }}</EmA>
			</div>
			<EmReactionsViewer v-if="appearNote.reactionAcceptance !== 'likeOnly'" :note="appearNote" :maxNumber="16">
				<template #more>
					<EmA :to="notePage(appearNote, 'reactions')" :class="$style.reactionOmitted">{{ i18n.ts.more }}</EmA>
				</template>
			</EmReactionsViewer>
			<footer :class="$style.footer">
				<a :href="notePage(appearNote)" target="_blank" rel="noopener" :class="[$style.footerButton, $style.footerButtonLink]" class="_button">
					<i class="ti ti-arrow-back-up"></i>
					<p v-if="appearNote.repliesCount > 0" :class="$style.footerButtonCount">{{ number(appearNote.repliesCount) }}</p>
				</a>
				<a :href="notePage(appearNote)" target="_blank" rel="noopener" :class="[$style.footerButton, $style.footerButtonLink]" class="_button">
					<template v-if="canRenote">
						<i class="ti ti-repeat"></i>
						<p v-if="appearNote.renoteCount > 0" :class="$style.footerButtonCount">{{ number(appearNote.renoteCount) }}</p>
					</template>
					<template v-else>
						<i class="ti ti-ban"></i>
					</template>
				</a>
				<a :href="notePage(appearNote)" target="_blank" rel="noopener" :class="[$style.footerButton, $style.footerButtonLink]" class="_button">
					<template v-if="appearNote.reactionAcceptance === 'likeOnly'">
						<i class="ti ti-heart"></i>
						<p v-if="appearNote.reactionCount > 0" :class="$style.footerButtonCount">{{ number(appearNote.reactionCount) }}</p>
					</template>
					<template v-else>
						<i class="ti ti-plus"></i>
					</template>
				</a>
				<a :href="notePage(appearNote)" target="_blank" rel="noopener" :class="[$style.footerButton, $style.footerButtonLink]" class="_button">
					<i class="ti ti-dots"></i>
				</a>
			</footer>
		</div>
	</article>
</div>
</template>

<script lang="ts" setup>
import { type ComputedRef, computed, inject, provide, ref } from 'vue';
import * as mfm from 'mfm-js';
import * as Misskey from 'misskey-js';
import { shouldCollapsed } from '@@/js/collapsed.js';
import { url } from '@@/js/config.js';
import I18n from '@/components/I18n.vue';
import EmNoteSub from '@/components/EmNoteSub.vue';
import EmNoteHeader from '@/components/EmNoteHeader.vue';
import EmNoteSimple from '@/components/EmNoteSimple.vue';
import EmInstanceTicker from '@/components/EmInstanceTicker.vue';
import EmReactionsViewer from '@/components/EmReactionsViewer.vue';
import EmMediaList from '@/components/EmMediaList.vue';
import EmPoll from '@/components/EmPoll.vue';
import EmMfm from '@/components/EmMfm.js';
import EmA from '@/components/EmA.vue';
import EmAvatar from '@/components/EmAvatar.vue';
import EmUserName from '@/components/EmUserName.vue';
import EmTime from '@/components/EmTime.vue';
import { notePage, number, userPage } from '@/utils.js';
import { i18n } from '@/i18n.js';
import { DI } from '@/di.js';

function getAppearNote(note: Misskey.entities.Note) {
	return Misskey.note.isPureRenote(note) ? note.renote : note;
}

const props = defineProps<{
	note: Misskey.entities.Note;
	pinned?: boolean;
}>();

const inChannel = inject<ComputedRef<boolean> | null>('inChannel', null);

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const note = ref(props.note);

const isRenoted = Misskey.note.isPureRenote(note.value);

const appearNote = computed(() => getAppearNote(note.value));
const showContent = ref(false);
const parsed = computed(() => appearNote.value.text ? mfm.parse(appearNote.value.text) : null);
const isLong = shouldCollapsed(appearNote.value, []);
const collapsed = ref(appearNote.value.cw == null && isLong);
const showTicker = computed(() => appearNote.value.user.instance != null || appearNote.value.channel != null);
const canRenote = computed(() => ['public', 'home'].includes(appearNote.value.visibility));

provide(DI.appearNote, appearNote);
</script>

<style lang="scss" module>
.root {
	position: relative;
	transition: box-shadow 0.1s ease;
	font-size: 1.05em;
	overflow: clip;
	contain: content;
	content-visibility: auto;
  contain-intrinsic-size: 0 150px;

	.footer {
		position: relative;
		z-index: 1;
	}

	&:hover > .article > .main > .footer > .footerButton {
		opacity: 1;
	}
}

.tip {
	display: flex;
	align-items: center;
	padding: 16px 32px 8px 32px;
	line-height: 24px;
	font-size: 90%;
	white-space: pre;
	color: #d28a3f;
}

.tip + .article {
	padding-top: 8px;
}

.replyTo {
	opacity: 0.7;
	padding-bottom: 0;
}

.renote {
	position: relative;
	display: flex;
	align-items: center;
	padding: 16px 32px 8px 32px;
	line-height: 28px;
	white-space: pre;
	color: var(--MI_THEME-renote);

	& + .article {
		padding-top: 8px;
	}
}

.renoteAvatar {
	flex-shrink: 0;
	display: inline-block;
	width: 28px;
	height: 28px;
	margin: 0 8px 0 0;
}

.renoteText {
	overflow: hidden;
	flex-shrink: 1;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.renoteUserName {
	font-weight: bold;
}

.renoteInfo {
	margin-left: auto;
	font-size: 0.9em;
}

.renoteTime {
	flex-shrink: 0;
	color: inherit;
}

.renoteMenu {
	margin-right: 4px;
}

.article {
	position: relative;
	display: flex;
	padding: 28px 32px;
}

.avatar {
	flex-shrink: 0;
	display: block !important;
	margin: 0 14px 0 0;
	width: 58px;
	height: 58px;
	position: sticky !important;
	top: calc(22px + var(--MI-stickyTop, 0px));
	left: 0;
}

.main {
	flex: 1;
	min-width: 0;
}

.cw {
	cursor: default;
	display: block;
	margin: 0;
	padding: 0;
	overflow-wrap: break-word;
}

.contentCollapsed {
	position: relative;
	min-height: 64px; // .showMoreFade
	max-height: 9em;
	overflow: clip;
}

.showMoreFade {
	display: block;
	position: absolute;
	z-index: 10;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 64px; // .contentCollapsed
	background: linear-gradient(0deg, var(--MI_THEME-panel), rgb(from var(--MI_THEME-panel) r g b / 0));
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

.text {
	overflow-wrap: break-word;
}

.replyIcon {
	color: var(--MI_THEME-accent);
	margin-right: 0.5em;
}

.poll {
	font-size: 80%;
}

.quote {
	padding: 8px 0;
}

.quoteNote {
	padding: 16px;
	border: dashed 1px var(--MI_THEME-renote);
	border-radius: 8px;
	overflow: clip;
}

.channel {
	opacity: 0.7;
	font-size: 80%;
}

.footer {
	margin-bottom: -14px;
}

.footerButton {
	margin: 0;
	padding: 8px;
	opacity: 0.7;

	&:not(:last-child) {
		margin-right: 28px;
	}

	&:hover {
		color: var(--MI_THEME-fgHighlighted);
	}
}

.footerButtonLink {
	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
	}
}

.footerButtonCount {
	display: inline;
	margin: 0 0 0 8px;
	opacity: 0.7;
}

@container (max-width: 580px) {
	.root {
		font-size: 0.95em;
	}

	.renote {
		padding: 12px 26px 0 26px;
	}

	.article {
		padding: 24px 26px;
	}

	.avatar {
		width: 50px;
		height: 50px;
	}
}

@container (max-width: 500px) {
	.root {
		font-size: 0.9em;
	}

	.renote {
		padding: 10px 22px 0 22px;
	}

	.article {
		padding: 20px 22px;
	}

	.footer {
		margin-bottom: -8px;
	}
}

@container (max-width: 480px) {
	.renote {
		padding: 8px 16px 0 16px;
	}

	.tip {
		padding: 8px 16px 0 16px;
	}

	.article {
		padding: 14px 16px;
	}
}

@container (max-width: 450px) {
	.avatar {
		margin: 0 10px 0 0;
		width: 46px;
		height: 46px;
		top: calc(14px + var(--MI-stickyTop, 0px));
	}
}

@container (max-width: 400px) {
	.root {
		.footerButton {
			&:not(:last-child) {
				margin-right: 18px;
			}
		}
	}
}

@container (max-width: 350px) {
	.root {
		.footerButton {
			&:not(:last-child) {
				margin-right: 12px;
			}
		}
	}
}

@container (max-width: 300px) {
	.avatar {
		width: 44px;
		height: 44px;
	}

	.root {
		.footerButton {
			&:not(:last-child) {
				margin-right: 8px;
			}
		}
	}
}

@container (max-width: 250px) {
	.quoteNote {
		padding: 12px;
	}
}

.reactionOmitted {
	display: inline-block;
	margin-left: 8px;
	opacity: .8;
	font-size: 95%;
}
</style>
