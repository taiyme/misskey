<template>
<MkEmoji :emoji="reaction" :custom-emojis="customEmojis ?? []" :is-reaction="true" :normal="true" :no-style="noStyle" :use-fallback-icon="useFallbackIcon"/>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { CustomEmoji } from 'misskey-js/built/entities';

defineProps<{
	reaction: string;
	customEmojis?: CustomEmoji[];
	noStyle?: boolean;
	useFallbackIcon?: boolean;
}>();
</script>
