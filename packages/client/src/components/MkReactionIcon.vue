<template>
<MkEmoji :emoji="reaction" :custom-emojis="customEmojis ?? []" :is-reaction="true" :normal="true" :no-style="noStyle" :use-fallback-icon="useFallbackIcon"/>
</template>

<script lang="ts" setup>
import { } from 'vue';

defineProps<{
	reaction: string;
	customEmojis?: {
		name: string;
		url: string;
	}[];
	noStyle?: boolean;
	useFallbackIcon?: boolean;
}>();
</script>
