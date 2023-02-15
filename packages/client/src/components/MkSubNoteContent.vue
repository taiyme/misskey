<template>
<div class="wrmlmaau" :class="{ collapsed, isLong }">
	<div ref="textEl" class="body">
		<span v-if="note.isHidden" style="opacity: 0.5">({{ i18n.ts.private }})</span>
		<span v-if="note.deletedAt" style="opacity: 0.5">({{ i18n.ts.deleted }})</span>
		<MkA v-if="note.replyId" class="reply" :to="`/notes/${note.replyId}`"><i class="ti ti-arrow-back-up"></i></MkA>
		<Mfm v-if="note.text" :text="note.text" :author="note.user" :i="$i" :custom-emojis="note.emojis"/>
		<MkA v-if="note.renoteId" class="rp" :to="`/notes/${note.renoteId}`">RN: ...</MkA>
	</div>
	<details v-if="note.files.length > 0">
		<summary>({{ $t('withNFiles', { n: note.files.length }) }})</summary>
		<XMediaList :media-list="note.files"/>
	</details>
	<details v-if="note.poll">
		<summary>{{ i18n.ts.poll }}</summary>
		<XPoll :note="note"/>
	</details>
	<button v-if="isLong && collapsed" class="fade _button" @click="collapsedFlag = false">
		<span>{{ i18n.ts.showMore }}</span>
	</button>
	<button v-else-if="isLong && !collapsed" class="showLess _button" @click="collapsedFlag = true">
		<span>{{ i18n.ts.showLess }}</span>
	</button>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import * as misskey from 'misskey-js';
import XMediaList from '@/components/MkMediaList.vue';
import XPoll from '@/components/MkPoll.vue';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';

const props = defineProps<{
	note: misskey.entities.Note;
}>();

const textEl = ref<HTMLElement>();
let textElHeight = $ref(0);
onMounted(() => {
	if (textEl.value) {
		const resizeObserver = new ResizeObserver(() => {
			textElHeight = textEl.value?.offsetHeight ?? 0;
		});
		resizeObserver.observe(textEl.value);
	}
});

const tmsIsLongEnabled = defaultStore.state.tmsIsLongEnabled ?? true;
const tmsIsLongTextElHeight = defaultStore.state.tmsIsLongTextElHeight ?? 500;
const isLong = $computed(() => {
	return tmsIsLongEnabled && !!(
		props.note.cw == null && 
		props.note.text != null && (
			(textElHeight >= tmsIsLongTextElHeight)
		)
	);
});
const collapsedFlag = ref(true);
const collapsed = $computed(() => collapsedFlag.value && isLong);
</script>

<style lang="scss" scoped>
.wrmlmaau {
	overflow-wrap: break-word;

	> .body {
		> .reply {
			margin-right: 6px;
			color: var(--accent);
		}

		> .rp {
			margin-left: 4px;
			font-style: oblique;
			color: var(--renote);
		}
	}
	&.isLong {
		> .showLess {
			width: 100%;
			margin-top: 1em;
			position: sticky;
			bottom: 1em;

			> span {
				display: inline-block;
				background: var(--popup);
				padding: 6px 10px;
				font-size: 0.8em;
				border-radius: 999px;
				box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
			}
		}
	}

	&.collapsed {
		position: relative;
		max-height: 9em;
		overflow: hidden;

		> .fade {
			display: block;
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 64px;
			background: linear-gradient(0deg, var(--panel), var(--X15));

			> span {
				display: inline-block;
				background: var(--panel);
				padding: 6px 10px;
				font-size: 0.8em;
				border-radius: 999px;
				box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
			}

			&:hover {
				> span {
					background: var(--panelHighlight);
				}
			}
		}
	}
}
</style>
