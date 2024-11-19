<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<EmMfm :text="user.name ?? user.username" :author="user" :plain="true" :nowrap="nowrap" :emojiUrls="user.emojis"/>
</template>

<script lang="ts" setup>
import type * as Misskey from 'misskey-js';
import EmMfm from '@/components/EmMfm.js';

withDefaults(defineProps<{
	user: Misskey.entities.User;
	nowrap?: boolean;
}>(), {
	nowrap: true,
});
</script>
