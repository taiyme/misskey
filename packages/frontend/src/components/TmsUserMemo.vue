<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="$i != null" class="_gaps_s">
	<XMemoInput v-if="iAmModerator" v-model="moderationNote" @update:modelValue="updateModerationNote">
		<template #heading>{{ i18n.ts.moderationNote }}</template>
		<template #caption>{{ i18n.ts._tms.moderationNoteIsSharedAmongModerators }}</template>
	</XMemoInput>
	<XMemoInput v-model="userMemo" @update:modelValue="updateUserMemo">
		<template #heading>{{ i18n.ts.memo }}</template>
		<template #caption>{{ i18n.ts._tms.memoIsNotShared }}</template>
	</XMemoInput>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue';
import type * as Misskey from 'misskey-js';
import { $i, iAmModerator } from '@/account.js';
import { i18n } from '@/i18n.js';
import { apiWithDialog } from '@/os.js';

const XMemoInput = defineAsyncComponent(() => import('@/components/TmsUserMemo.input.vue'));

const props = defineProps<{
	user: Misskey.entities.UserDetailed;
}>();

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const moderationNote = ref(props.user.moderationNote ?? '');

const updateModerationNote = () => {
	apiWithDialog('admin/update-user-note', {
		userId: props.user.id,
		text: moderationNote.value || '',
	});
};

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const userMemo = ref(props.user.memo ?? '');

const updateUserMemo = () => {
	apiWithDialog('users/update-memo', {
		userId: props.user.id,
		memo: userMemo.value || '',
	});
};
</script>
