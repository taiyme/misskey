<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<EmCustomEmoji v-if="reaction[0] === ':'" :name="reaction" :normal="true" :noStyle="noStyle" :url="emojiUrl" :fallbackToImage="true"/>
<EmEmoji v-else :emoji="reaction" :normal="true" :noStyle="noStyle"/>
</template>

<script lang="ts" setup>
import EmCustomEmoji from '@/components/EmCustomEmoji.vue';
import EmEmoji from '@/components/EmEmoji.vue';

defineProps<{
	reaction: string;
	noStyle?: boolean;
	emojiUrl?: string;
}>();
</script>
