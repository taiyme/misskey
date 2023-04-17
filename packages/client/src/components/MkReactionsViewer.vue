<template>
<div :class="$style.root" class="tdflqwzn">
	<XReaction
		v-for="[reaction, count] in reactions"
		:key="reaction"
		:reaction="reaction"
		:count="count"
		:is-initial="initialReactions.has(reaction)"
		:note="note"
	/>
	<slot v-if="hasMoreReactions" name="more"></slot>
</div>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import { Note } from 'misskey-js/built/entities';
import XReaction from '@/components/MkReactionsViewer.reaction.vue';

const props = withDefaults(defineProps<{
	note: Note;
	maxNumber?: number;
}>(), {
	maxNumber: Infinity,
});

const initialReactions = new Set(Object.keys(props.note.reactions));

let reactions = $ref<[string, number][]>([]);
let hasMoreReactions = $ref(false);

if (props.note.myReaction && !Object.keys(reactions).includes(props.note.myReaction)) {
	// eslint-disable-next-line vue/no-setup-props-destructure
	reactions[props.note.myReaction] = props.note.reactions[props.note.myReaction];
}

watch([(): Record<string, number> => props.note.reactions, (): number => props.maxNumber], ([newSource, maxNumber]) => {
	let newReactions: [string, number][] = [];
	hasMoreReactions = Object.keys(newSource).length > maxNumber;

	for (let i = 0; i < reactions.length; i++) {
		const reaction = reactions[i][0];
		if (reaction in newSource && newSource[reaction] !== 0) {
			reactions[i][1] = newSource[reaction];
			newReactions.push(reactions[i]);
		}
	}

	const newReactionsNames = newReactions.map(([x]) => x);
	newReactions = [
		...newReactions,
		...Object.entries(newSource)
			.sort(([, a], [, b]) => b - a)
			.filter(([y], i) => i < maxNumber && !newReactionsNames.includes(y)),
	];

	newReactions = newReactions.slice(0, props.maxNumber);

	if (props.note.myReaction && !newReactions.map(([x]) => x).includes(props.note.myReaction)) {
		newReactions.push([props.note.myReaction, newSource[props.note.myReaction]]);
	}

	reactions = newReactions;
}, { immediate: true, deep: true });
</script>

<style lang="scss" module>
.root {
	margin: 4px -2px 0 -2px;
	display: flex;
	flex-wrap: wrap;
	gap: 4px;

	&:empty {
		display: none;
	}
}
</style>
