<template>
<button ref="buttonRef" class="eddddedb _button" :class="{ canRenote }" @click="renote()">
	<template v-if="canRenote">
		<i class="ti ti-repeat"></i>
		<p v-if="count > 0" class="count">{{ count }}</p>
	</template>
	<i v-else class="ti ti-ban"></i>
</button>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import * as misskey from 'misskey-js';
import XDetails from '@/components/MkUsersTooltip.vue';
import { pleaseLogin } from '@/scripts/please-login';
import * as os from '@/os';
import { $i } from '@/account';
import { useTooltip } from '@/scripts/use-tooltip';
import { i18n } from '@/i18n';
import { pakuru, numberquote } from '@/scripts/pakuru';
import { defaultStore } from '@/store';

const props = defineProps<{
	note: misskey.entities.Note;
	count: number;
}>();

const buttonRef = ref<HTMLElement>();

const canRenote = computed(() => ['public', 'home'].includes(props.note.visibility) || props.note.userId === $i.id);
const canPakuru = computed(() => defaultStore.state.tmsPakuruEnabled || defaultStore.state.tmsNumberquoteEnabled);

useTooltip(buttonRef, async (showing) => {
	if (!canRenote.value) return;

	const renotes = await os.api('notes/renotes', {
		noteId: props.note.id,
		limit: 11,
	});

	const users = renotes.map(x => x.user);

	if (users.length < 1) return;

	os.popup(XDetails, {
		showing,
		users,
		count: props.count,
		targetElement: buttonRef.value,
	}, {}, 'closed');
});

const renote = (viaKeyboard = false) => {
	if (!canRenote.value && !canPakuru.value) return;

	pleaseLogin();

	const renoteMenu = [
		{
			text: i18n.ts.renote,
			icon: 'ti ti-repeat',
			action: () => {
				os.api('notes/create', {
					renoteId: props.note.id,
				});
			},
		},
		{
			text: i18n.ts.quote,
			icon: 'ti ti-quote',
			action: () => {
				os.post({
					renote: props.note,
				});
			},
		},
	];

	const pakuruMenu = [
		defaultStore.state.tmsPakuruEnabled ? {
			text: 'パクる',
			icon: 'ti ti-swipe',
			action: () => pakuru(props.note),
		} : undefined,
		defaultStore.state.tmsNumberquoteEnabled ? {
			text: '数字引用する',
			icon: 'ti ti-exposure-plus-1',
			action: () => numberquote(props.note),
		} : undefined,
	];

	const menu = [
		...canRenote.value ? renoteMenu : [],
		canRenote.value && canPakuru.value ? null : undefined,
		...canPakuru.value ? pakuruMenu : [],
	];

	os.popupMenu(menu, buttonRef.value, { viaKeyboard });
};
</script>

<style lang="scss" scoped>
.eddddedb {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
	border-radius: 4px;

	&:not(.canRenote) {
		cursor: default;
	}

	&.renoted {
		background: var(--accent);
	}

	> .count {
		display: inline;
		margin-left: 8px;
		opacity: 0.7;
	}
}
</style>
