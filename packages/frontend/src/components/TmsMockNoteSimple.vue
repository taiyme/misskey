<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div inert>
	<MkOmit :maxHeight="100" hiddenFadeButton>
		<MkNoteSimple :note="props.note"/>
	</MkOmit>
</div>
</template>

<script lang="ts" setup>
import { provide } from 'vue';
import * as Misskey from 'misskey-js';
import MkNoteSimple from '@/components/MkNoteSimple.vue';
import MkOmit from '@/components/MkOmit.vue';

const props = defineProps<{
	note: Misskey.entities.Note;
}>();

provide('disableNoteCollapsed', true);
</script>
