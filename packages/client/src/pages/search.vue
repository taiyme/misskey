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

		<div v-if="searchType === 'note'">
			<TransitionGroup
				v-if="pickup"
				:enter-active-class="$store.state.animation ? $style.transition_x_enterActive : ''"
				:leave-active-class="$store.state.animation ? $style.transition_x_leaveActive : ''"
				:enter-from-class="$store.state.animation ? $style.transition_x_enterFrom : ''"
				:leave-to-class="$store.state.animation ? $style.transition_x_leaveTo : ''"
				:move-class="$store.state.animation ? $style.transition_x_move : ''"
				:class="$style.pickup"
				tag="div"
			>
				<div :class="$style.pickupLabel">Pickup</div>
				<div v-if="pickup.type === 'fetch'" :class="$style.pickupFetch">
					<div><MkLoading :em="true"/></div>
					<div>{{ pickup.value ?? i18n.ts.processing }}</div>
				</div>
				<MkUserInfo v-if="pickup.type === 'user'" style="border-radius: 0 !important;" :user="pickup.value"/>
				<MkNote v-if="pickup.type === 'note'" style="border-radius: 0 !important;" :note="pickup.value"/>
			</TransitionGroup>
			<MkNotes v-if="searchQuery" ref="notes" :pagination="notePagination"/>
		</div>
		<div v-if="searchType === 'user'">
			<FormRadios v-model="searchOrigin" style="margin-bottom: var(--margin);" @update:model-value="search()">
				<option value="combined">{{ i18n.ts.all }}</option>
				<option value="local">{{ i18n.ts.local }}</option>
				<option value="remote">{{ i18n.ts.remote }}</option>
			</FormRadios>
			<MkUserList v-if="searchQuery" ref="users" :pagination="userPagination"/>
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
	type: 'fetch';
	value: string | null;
} | null>(null);

onMounted(() => {
	searchQuery = props.query || '';
	searchType = props.type ?? 'note';
	searchOrigin = props.origin ?? 'combined';

	if (searchQuery) search();
});

const search = async (): Promise<void> => {
	const query = searchQuery.toString().trim();
	if (query == null || query === '') {
		pickup = null;
		return;
	}

	const parsed = mfm.parse(query);
	const mfmType = parsed.length === 1 ? parsed[0].type : null;

	const fetching = (msg?: string | null): void => {
		pickup = {
			type: 'fetch',
			value: msg ?? null,
		};
	};

	switch (mfmType) {
		case 'mention': {
			fetching();
			const [username, host = undefined] = query.split('@').filter(x => x);
			os.api('users/show', { username, host }).then(user => {
				pickup = {
					type: 'user',
					value: user,
				};
			}).catch(() => pickup = null);
			break;
		}

		case 'url': {
			fetching(i18n.ts.fetchingAsApObject);
			const promise = os.api('ap/show', {
				uri: query,
			});
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
	
	if (location.pathname === '/search') {
		window.history.replaceState(null, '', `/search?q=${encodeURIComponent(query)}&type=${searchType}${searchType === 'user' ? `&origin=${searchOrigin}` : ''}`);
	}
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
.transition_x_move, .transition_x_enterActive, .transition_x_leaveActive {
	transition: opacity 0.1s cubic-bezier(0, 0.5, 0.5, 1), transform 0.1s cubic-bezier(0, 0.5, 0.5, 1) !important;
}

.transition_x_enterFrom, .transition_x_leaveTo {
	opacity: 0;
	transform: scale(0.95);
}

.transition_x_leaveActive {
	position: absolute;
}

.pickup {
	overflow: hidden;
	background: var(--panel);
	border-radius: var(--radius);
	margin-bottom: var(--margin);
}

.pickupLabel {
	font-weight: 700;
	padding: calc(var(--margin) / 2) var(--margin);
}

.pickupFetch {
	text-align: center;
	padding: 32px;
}
</style>
