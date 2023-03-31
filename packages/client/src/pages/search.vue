<!-- eslint-disable-line vue/multi-word-component-names -->
<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="800">
		<FormInput v-model="searchQuery" :large="true" :autofocus="true" :debounce="true" type="search" style="margin-bottom: var(--margin);" @update:model-value="search()">
			<template #prefix><i class="ti ti-search"></i></template>
		</FormInput>
		<MkTab v-model="searchType" style="margin-bottom: var(--margin);" @update:model-value="search()">
			<option value="note">{{ i18n.ts.note }}</option>
			<option value="user">{{ i18n.ts.user }}</option>
		</MkTab>

		<div>
			<div v-if="pickup">
				<div>Pickup</div>
				<template v-if="pickup.type === 'user'">
					<MkUserInfo :class="$style.pickupUser" :user="pickup.value"/>
				</template>
				<template v-else-if="pickup.type === 'note'">
					<MkNote :class="$style.pickupNote" :note="pickup.value"/>
				</template>
				<template v-else-if="pickup.type === 'hashtag'">
					<MkA :class="$style.pickupHashtag" style="color: var(--hashtag);" :to="pickup.path">{{ pickup.value }}</MkA>
				</template>
			</div>

			<div v-if="searchType === 'note'">
				<MkNotes v-if="searchQuery" ref="notes" :pagination="notePagination"/>
			</div>
			<div v-else>
				<FormRadios v-model="searchOrigin" style="margin-bottom: var(--margin);" @update:model-value="search()">
					<option value="combined">{{ i18n.ts.all }}</option>
					<option value="local">{{ i18n.ts.local }}</option>
					<option value="remote">{{ i18n.ts.remote }}</option>
				</FormRadios>
				<MkUserList v-if="searchQuery" ref="users" :pagination="userPagination"/>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import * as misskey from 'misskey-js';
import * as mfm from 'mfm-js';
import MkNote from '@/components/MkNote.vue';
import MkNotes from '@/components/MkNotes.vue';
import MkUserInfo from '@/components/MkUserInfo.vue';
import MkUserList from '@/components/MkUserList.vue';
import MkTab from '@/components/MkTab.vue';
import FormInput from '@/components/form/input.vue';
import FormRadios from '@/components/form/radios.vue';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import * as os from '@/os';
import { useRouter } from '@/router';

const router = useRouter();

type SearchType = 'note' | 'user';
type SearchOrigin = 'combined' | 'local' | 'remote';

const props = defineProps<{
	query: string;
	channel?: string;
	type?: SearchType;
	origin?: SearchOrigin;
}>();

let searchQuery = $ref('');
let searchType = $ref<SearchType>('note');
let searchOrigin = $ref<SearchOrigin>('combined');

let pickup = $ref<{
	type: 'note';
	value: misskey.entities.Note;
} | {
	type: 'user';
	value: misskey.entities.UserDetailed;
} | {
	type: 'hashtag';
	value: string;
	path: string;
} | null>(null);

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

	switch (mfmType) {
		case 'mention': {
			const [username, host = undefined] = query.split('@').filter(x => x);
			os.api('users/show', { username, host }).then(user => {
				pickup = {
					type: 'user',
					value: user,
				};
			}).catch(() => pickup = null);
			break;
		}

		case 'hashtag': {
			pickup = {
				type: 'hashtag',
				value: query,
				path: `/tags/${encodeURIComponent(query.slice(1))}`,
			};
			break;
		}

		case 'url': {
			const promise = os.api('ap/show', {
				uri: query,
			});
			os.promiseDialog(promise, null, null, i18n.ts.fetchingAsApObject);
			promise.then(res => {
				if (res.type === 'User') {
					pickup = {
						type: 'user',
						value: res.object,
					};
				}
				if (res.type === 'Note') {
					pickup = {
						type: 'note',
						value: res.object,
					};
				}
			}).catch(() => pickup = null);
			break;
		}

		default: {
			pickup = null;
			break;
		}
	}

	router.replace(`/search?q=${encodeURIComponent(query)}&type=${searchType}${searchType === 'user' ? `&origin=${searchOrigin}` : ''}`);
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

<style lang="scss" module>
.pickupUser {}

.pickupNote {}

.pickupHashtag {}
</style>
