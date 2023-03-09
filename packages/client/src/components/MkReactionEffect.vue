<template>
<div :class="$style.root" :style="{ zIndex, top: `${y - 64}px`, left: `${x - 64}px` }">
	<span :class="[$style.text, { [$style.up]: up }]">
		<MkReactionIcon class="icon" :reaction="reaction" :custom-emojis="emojis"/>
	</span>
</div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import * as os from '@/os';
import MkReactionIcon from '@/components/MkReactionIcon.vue';

withDefaults(defineProps<{
	reaction: string;
	emojis: {
		name: string;
		url: string;
	}[];
	x: number;
	y: number;
}>(), {
});

const emit = defineEmits<{
	(ev: 'end'): void;
}>();

let up = $ref(false);
// Original: os.claimZIndex('middle');
const zIndex = os.claimZIndex('low');
// Original: (90 - (Math.random() * 180)) + 'deg';
const angle = (45 - (Math.random() * 90)) + 'deg';

onMounted(() => {
	window.setTimeout(() => {
		up = true;
	}, 10);

	window.setTimeout(() => {
		emit('end');
	}, 1100);
});
</script>

<style lang="scss" module>
.root {
	pointer-events: none;
	position: fixed;
	width: 128px;
	height: 128px;
}

.text {
	display: block;
	height: 1em;
	text-align: center;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	margin: auto;
	color: var(--accent);
	font-size: 18px;
	font-weight: bold;
  // Original: translateY(-30px);
  transform: translateY(-20px);
  // Original: transform 1s cubic-bezier(0, 0.5, 0, 1), opacity 1s cubic-bezier(0.5, 0, 1, 0.5);
	transition: transform 1s cubic-bezier(0, 0.5, 0, 1), opacity 1s cubic-bezier(0.5, 0, 1, 1);
	will-change: opacity, transform;

	&.up {
		opacity: 0;
		// Original: translateY(-50px) rotateZ(v-bind(angle));
    transform: translateY(-40px) rotateZ(v-bind(angle));
	}
}
</style>
