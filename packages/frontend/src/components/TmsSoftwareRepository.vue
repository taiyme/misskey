<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<FormLink v-if="repositoryUrl" :to="repositoryUrl" external>
	<template #icon><i class="ti ti-code"></i></template>
	<template #default>{{ i18n.ts.sourceCode }}</template>
	<template #suffix>Repository</template>
</FormLink>
<FormLink v-if="tarballUrl" :to="tarballUrl" external>
	<template #icon><i class="ti ti-download"></i></template>
	<template #default>{{ i18n.ts.sourceCode }}</template>
	<template #suffix>Tarball</template>
</FormLink>
<MkInfo v-if="notProvided" warn>
	<template #default>{{ i18n.ts.sourceCodeIsNotYetProvided }}</template>
</MkInfo>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { version } from '@@/js/config.js';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import FormLink from '@/components/form/link.vue';
import MkInfo from '@/components/MkInfo.vue';

// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
const repositoryUrl = computed(() => instance.repositoryUrl || null);
const tarballUrl = computed(() => instance.providesTarball ? `/tarball/misskey-${version}.tar.gz` : null);
const notProvided = computed(() => repositoryUrl.value == null && tarballUrl.value == null);
</script>
