<template>
<MkWindow
	ref="window"
	:initial-width="300"
	:initial-height="290"
	:can-resize="true"
	:mini="true"
	:front="true"
	@closed="emit('closed')"
>
	<MkEmojiPicker :show-pinned="showPinned" :as-reaction-picker="asReactionPicker" as-window :class="$style.picker" @chosen="chosen"/>
</MkWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import MkWindow from '@/components/MkWindow.vue';
import MkEmojiPicker from '@/components/MkEmojiPicker.vue';

withDefaults(defineProps<{
	src?: HTMLElement;
	showPinned?: boolean;
	asReactionPicker?: boolean;
}>(), {
	src: undefined,
	showPinned: true,
});

const emit = defineEmits<{
	(ev: 'chosen', v: string): void;
	(ev: 'closed'): void;
}>();

const chosen = (emoji: string): void => {
	emit('chosen', emoji);
};
</script>

<style lang="scss" module>
.picker {
	height: 100%;
}
</style>
