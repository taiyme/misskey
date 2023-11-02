<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<MediaImage
		v-if="image"
		:image="image"
		:disableImageLink="true"
	/>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type * as Misskey from 'misskey-js';
import type { ImageBlock } from './block.type.js';
import type MediaImage from '@/components/MkMediaImage.vue';

const props = defineProps<{
	block: ImageBlock;
	page: Misskey.entities.Page;
}>();

const image = ref<Misskey.entities.DriveFile>(props.page.attachedFiles.find(x => x.id === props.block.fileId));
</script>
