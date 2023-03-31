<!-- eslint-disable-line vue/multi-word-component-names -->
<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="800">
		<FormInput v-model="searchQuery" :large="true" :autofocus="true" :debounce="true" type="search" style="margin-bottom: var(--margin);" @update:model-value="search()">
			<template #prefix><i class="ti ti-search"></i></template>
		</FormInput>
		<XTab v-model="searchType" style="margin-bottom: var(--margin);" @update:model-value="search()">
			<option value="note">{{ i18n.ts.note }}</option>
			<option value="user">{{ i18n.ts.user }}</option>
		</XTab>

		<div v-if="searchType === 'note'">
			<XNotes v-if="searchQuery" ref="notes" :pagination="notePagination"/>
		</div>
		<div v-else>
			<FormRadios v-model="searchOrigin" style="margin-bottom: var(--margin);" @update:model-value="search()">
				<option value="combined">{{ i18n.ts.all }}</option>
				<option value="local">{{ i18n.ts.local }}</option>
				<option value="remote">{{ i18n.ts.remote }}</option>
			</FormRadios>

			<XUserList v-if="searchQuery" ref="users" :pagination="userPagination"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import * as mfm from 'mfm-js';
import XNotes from '@/components/MkNotes.vue';
import XUserList from '@/components/MkUserList.vue';
import XTab from '@/components/MkTab.vue';
import FormInput from '@/components/form/input.vue';
import FormRadios from '@/components/form/radios.vue';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import * as os from '@/os';
import { mainRouter } from '@/router';

const props = defineProps<{
	query: string;
	channel?: string;
	type?: string;
	origin?: string;
}>();

let searchQuery = $ref('');
let searchType = $ref('note');
let searchOrigin = $ref('combined');

onMounted(() => {
	searchQuery = props.query || '';
	searchType = props.type ?? 'note';
	searchOrigin = props.origin ?? 'combined';

	if (searchQuery) {
		search();
	}
});

const search = async (): Promise<void> => {
	const query = searchQuery.toString().trim();
	if (query == null || query === '') return;

	const parsed = mfm.parse(query);
	const mfmType = parsed.length === 1 ? parsed[0].type : null;

	if (mfmType === 'mention') {
		mainRouter.push(`/${query}`);
		return;
	}

	if (mfmType === 'hashtag') {
		mainRouter.push(`/tags/${encodeURIComponent(query.slice(1))}`);
		return;
	}

	if (mfmType === 'url') {
		const promise = os.api('ap/show', {
			uri: query,
		});

		os.promiseDialog(promise, null, null, i18n.ts.fetchingAsApObject);

		const res = await promise;

		switch (res.type) {
			case 'User': {
				mainRouter.push(`/@${res.object.username}@${res.object.host}`);
				break;
			}
			case 'Note': {
				mainRouter.push(`/notes/${res.object.id}`);
				break;
			}
		}

		return;
	}

	window.history.replaceState('', '', `/search?q=${encodeURIComponent(query)}&type=${searchType}${searchType === 'user' ? `&origin=${searchOrigin}` : ''}`);
};

const notePagination = {
	endpoint: 'notes/search' as const,
	limit: 10,
	params: computed(() => ({
		query: searchQuery,
		channelId: props.channel,
	})),
};
const userPagination = {
	endpoint: 'users/search' as const,
	limit: 10,
	params: computed(() => ({
		query: searchQuery,
		origin: searchOrigin,
	})),
};

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(computed(() => ({
	title: searchQuery ? i18n.t('searchWith', { q: searchQuery }) : i18n.ts.search,
	icon: 'ti ti-search',
})));
</script>
