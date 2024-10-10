<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<FormSplit>
	<MkKeyValue :copy="version">
		<template #key>{{ i18n.ts._tms.taiyme }}</template>
		<template #value>{{ version }}</template>
	</MkKeyValue>
	<MkKeyValue :copy="commitHash">
		<template #key>{{ i18n.ts._tms.commitHash }}</template>
		<template #value>
			<span v-if="commitHash != null">{{ commitHash }}</span>
			<span v-else style="opacity: 0.7;">({{ i18n.ts.unknown }})</span>
		</template>
	</MkKeyValue>
</FormSplit>
</template>

<script lang="ts" setup>
import { commitHash, version } from '@@/js/config.js';
import { i18n } from '@/i18n.js';
import FormSplit from '@/components/form/split.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
</script>
