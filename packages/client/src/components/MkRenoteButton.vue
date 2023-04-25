<template>
<button ref="buttonRef" class="eddddedb _button" :class="{ canRenote, canPakuru }" @click="renote()">
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
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import { pleaseLogin } from '@/scripts/please-login';
import * as os from '@/os';
import { $i } from '@/account';
import { useTooltip } from '@/scripts/use-tooltip';
import { i18n } from '@/i18n';
import { pakuru, numberquote } from '@/scripts/tms/pakuru';
import { tmsStore } from '@/tms/store';

const props = defineProps<{
	note: misskey.entities.Note;
	count: number;
}>();

const buttonRef = ref<HTMLElement>();

const canRenote = computed(() => ['public', 'home'].includes(props.note.visibility) || props.note.userId === $i?.id);
const canPakuru = computed(() => tmsStore.state.usePakuru || tmsStore.state.useNumberquote);

const renoteAnime = (): void => {
	const el = buttonRef.value;
	if (el) {
		const rect = el.getBoundingClientRect();
		const x = rect.left + (el.offsetWidth / 2);
		const y = rect.top + (el.offsetHeight / 2);
		os.popup(MkRippleEffect, { x, y }, {}, 'end');
	}
};

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

const renote = (viaKeyboard = false): void => {
	if (!canRenote.value && !canPakuru.value) return;

	pleaseLogin();

	const renoteMenu = [
		{
			text: i18n.ts.renote,
			icon: 'ti ti-repeat',
			action: (): void => {
				renoteAnime();

				os.api('notes/create', {
					renoteId: props.note.id,
				});
			},
		},
		{
			text: i18n.ts.quote,
			icon: 'ti ti-quote',
			action: (): void => {
				os.post({
					renote: props.note,
				});
			},
		},
	];

	const pakuruMenu = [
		tmsStore.state.usePakuru ? {
			text: i18n.ts._tms.pakuru,
			icon: 'ti ti-swipe',
			action: (): void => {
				renoteAnime();
				pakuru(props.note);
			},
		} : undefined,
		tmsStore.state.useNumberquote ? {
			text: i18n.ts._tms.numberquote,
			icon: 'ti ti-exposure-plus-1',
			action: (): void => {
				renoteAnime();
				numberquote(props.note);
			},
		} : undefined,
	];

	const menu = [
		...canRenote.value ? renoteMenu : [],
		canRenote.value && canPakuru.value ? null : undefined,
		...canPakuru.value ? pakuruMenu : [],
	];

	os.popupMenu(menu, buttonRef.value, { viaKeyboard });
};

defineExpose({
	renote,
});
</script>

<style lang="scss" scoped>
.eddddedb {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
	border-radius: 4px;

	&:not(.canRenote):not(.canPakuru) {
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
