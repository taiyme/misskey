<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/>
	</template>

	<MkSpacer v-if="tab === 'note'" :contentMax="800">
		<XNote/>
	</MkSpacer>

	<MkSpacer v-else-if="tab === 'user'" :contentMax="800">
		<XUser/>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref } from 'vue';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';

const XNote = defineAsyncComponent(() => import('./search.note.vue'));
const XUser = defineAsyncComponent(() => import('./search.user.vue'));

const tab = ref<'note' | 'user'>('note');

const headerActions = computed(() => []);

const headerTabs = computed(() => [{
	key: 'note' as const,
	title: i18n.ts.notes,
	icon: 'ti ti-pencil',
}, {
	key: 'user' as const,
	title: i18n.ts.users,
	icon: 'ti ti-users',
}]);

definePageMetadata(computed(() => ({
	title: i18n.ts.search,
	icon: 'ti ti-search',
})));
</script>
