<template>
<MkEmoji :emoji="reaction" :custom-emojis="customEmojis || []" :is-reaction="true" :normal="true" :no-style="noStyle" :use-fallback-icon="useFallbackIcon"/>
</template>

<script lang="ts" setup>
import { } from 'vue';

const props = defineProps<{
	reaction: string;
	customEmojis?: any[]; // TODO
	noStyle?: boolean;
	useFallbackIcon?: boolean;
}>();
</script>
