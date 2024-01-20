<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="$i != null" class="_gaps_s">
	<XMemoInput v-if="iAmModerator" v-model="moderationNote" @update:modelValue="updateModerationNote">
		<template #heading>{{ i18n.ts.moderationNote }}</template>
	</XMemoInput>
	<XMemoInput v-model="userMemo" @update:modelValue="updateUserMemo">
		<template #heading>{{ i18n.ts.memo }}</template>
	</XMemoInput>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as Misskey from 'misskey-js';
import { $i, iAmModerator } from '@/account.js';
import { i18n } from '@/i18n.js';
import { apiWithDialog } from '@/os.js';
import XMemoInput from './TmsUserMemo.input.vue';

const props = defineProps<{
	user: Misskey.entities.UserDetailed;
}>();

const moderationNote = ref(props.user.moderationNote ?? '');

const updateModerationNote = () => {
	apiWithDialog('admin/update-user-note', {
		userId: props.user.id,
		text: moderationNote.value ?? '',
	});
};

const userMemo = ref(props.user.memo ?? '');

const updateUserMemo = () => {
	apiWithDialog('users/update-memo', {
		userId: props.user.id,
		memo: userMemo.value ?? '',
	});
};
</script>
