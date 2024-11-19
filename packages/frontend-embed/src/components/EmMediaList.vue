<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.cq">
	<template v-for="media in notPreviewableMediaList">
		<XAudio v-if="media.type.startsWith('audio') && media.type !== 'audio/midi'" :key="`audio:${media.id}`" :audio="media" :class="$style.banner"/>
		<XBanner v-else :key="`banner:${media.id}`" :media="media" :class="$style.banner"/>
	</template>
	<div v-if="previewableMediaList.length > 0" :class="$style.container">
		<div
			:class="[
				$style.mediaList,
				previewableMediaList.length === 1
					? $style.n1
					: previewableMediaList.length === 2
						? $style.n2
						: previewableMediaList.length === 3
							? $style.n3
							: previewableMediaList.length === 4
								? $style.n4
								: $style.nMany,
			]"
		>
			<template v-for="media in previewableMediaList">
				<XVideo v-if="media.type.startsWith('video')" :key="`video:${media.id}`" :video="media" :class="$style.media"/>
				<XImage v-else-if="media.type.startsWith('image')" :key="`image:${media.id}`" :image="media" :raw="raw" :class="$style.media"/>
			</template>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { FILE_TYPE_BROWSERSAFE } from '@@/js/const.js';
import type * as Misskey from 'misskey-js';
import XAudio from '@/components/EmMediaAudio.vue';
import XBanner from '@/components/EmMediaBanner.vue';
import XImage from '@/components/EmMediaImage.vue';
import XVideo from '@/components/EmMediaVideo.vue';

const EXPANDED_MIN_HEIGHT = 80 as const;

const props = defineProps<{
	mediaList: Misskey.entities.DriveFile[];
	raw?: boolean;
}>();

const previewable = (file: Misskey.entities.DriveFile) => {
	if (file.type === 'image/svg+xml') return true; // svgのwebpublic/thumbnailはpngなのでtrue
	// FILE_TYPE_BROWSERSAFEに適合しないものはブラウザで表示するのに不適切
	return (file.type.startsWith('video') || file.type.startsWith('image')) && FILE_TYPE_BROWSERSAFE.includes(file.type);
};

const previewableMediaList = computed(() => props.mediaList.filter(media => previewable(media)));
const notPreviewableMediaList = computed(() => props.mediaList.filter(media => !previewable(media)));
</script>

<style lang="scss" module>
.cq {
	container: mediaList / inline-size;
	--mediaList-radius: 8px;
}

.container {
	box-sizing: border-box;
	position: relative;
	width: 100%;
	margin-top: 4px;
}

.mediaList {
	display: grid;
	gap: 8px;
	height: 100%;
	width: 100%;

	&.n1 {
		grid-template-rows: 1fr;
		min-height: v-bind("`${EXPANDED_MIN_HEIGHT}px`");
		max-height: clamp(
			v-bind("`${EXPANDED_MIN_HEIGHT}px`"),
			50cqh,
			min(360px, 50vh)
		);
	}

	&.n2 {
		aspect-ratio: 16 / 9;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr;
	}

	&.n3 {
		aspect-ratio: 16 / 9;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;

		> .media:nth-child(1) {
			grid-row: 1 / 3;
		}

		> .media:nth-child(3) {
			grid-column: 2 / 3;
			grid-row: 2 / 3;
		}
	}

	&.n4 {
		aspect-ratio: 16 / 9;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
	}

	&.nMany {
		grid-template-columns: 1fr 1fr;

		> .media {
			aspect-ratio: 16 / 9;
		}
	}
}

.banner {
	overflow: hidden; // clipにするとバグる
	margin-top: 4px;
}

.media {
	overflow: hidden; // clipにするとバグる
}

@container mediaList (max-width: 210px) {
	.mediaList:not(.n1) {
		aspect-ratio: unset !important;
		grid-template-columns: 1fr !important;
		grid-template-rows: unset !important;

		> .media {
			aspect-ratio: 16 / 9 !important;
			grid-column: unset !important;
			grid-row: unset !important;
		}
	}
}
</style>
