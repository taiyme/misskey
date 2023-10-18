<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<div class="_gaps">
		<MkInput v-model="inputSearchQuery" large autofocus type="search" @enter="searchUser">
			<template #prefix><i class="ti ti-search"></i></template>
		</MkInput>
		<MkFolder>
			<template #label>{{ i18n.ts.options }}</template>
			<div class="_gaps_s">
				<MkRadios v-model="inputSearchOrigin">
					<option value="combined">{{ i18n.ts.all }}</option>
					<option value="local">{{ i18n.ts.local }}</option>
					<option value="remote">{{ i18n.ts.remote }}</option>
				</MkRadios>
			</div>
		</MkFolder>
		<div class="_buttonsCenter">
			<MkButton v-if="!initial" large rounded :disabled="fetching" @click="searchClear">{{ i18n.ts.clear }}</MkButton>
			<MkButton large primary gradate rounded :disabled="!searchEnabled" @click="searchUser">{{ i18n.ts.search }}</MkButton>
		</div>
	</div>

	<template v-if="fetching">
		<div :class="$style.fetching">
			<MkLoading :class="$style.fetchingIcon" em/>
			<div>{{ i18n.ts.fetchingAsApObject }}<MkEllipsis/></div>
		</div>
	</template>
	<template v-else-if="initial">
		<MkInfo>{{ i18n.ts._tms.pickupAvailable + '\n' + i18n.ts._tms.pickupUserDescription }}</MkInfo>
	</template>
	<template v-else-if="!userPickup && !userPagination">
		<div class="_fullinfo" style="padding: 32px;">
			<img :src="infoImageUrl" class="_ghost"/>
			<div>{{ i18n.ts.noUsers }}</div>
		</div>
	</template>
	<template v-else>
		<MkFoldableSection v-if="userPickup" expanded>
			<template #header>{{ i18n.ts._tms.pickup }}</template>
			<div :class="$style.pickupUser">
				<MkUserInfo :key="userPickup.id" :user="userPickup"/>
			</div>
		</MkFoldableSection>
		<MkFoldableSection v-if="userPagination" expanded>
			<template #header>{{ i18n.ts.searchResult }}</template>
			<MkUserList :key="`search.user:${searchedCounter}`" :pagination="userPagination"/>
		</MkFoldableSection>
	</template>
</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import MkUserInfo from '@/components/MkUserInfo.vue';
import MkUserList from '@/components/MkUserList.vue';
import MkInfo from '@/components/MkInfo.vue';
import { i18n } from '@/i18n.js';
import { useRouter } from '@/router.js';
import { infoImageUrl } from '@/instance.js';
import { sleep } from '@/scripts/tms/promise.js';
import { searchUser as _searchUser, type UserPickup, type UserPagination } from '@/scripts/tms/search.js';

export type SearchOrigin = 'combined' | 'local' | 'remote';

useRouter();

const initial = ref(true);
const fetching = ref(false);
const searchedCounter = ref(0);

const inputSearchQuery = ref('');
const inputSearchOrigin = ref<SearchOrigin>('combined');

const searchEnabled = computed<boolean>(() => {
	if (fetching.value) return false;
	if (!inputSearchQuery.value.trim()) return false;
	return true;
});

const userPickup = ref<UserPickup>(null);
const userPagination = ref<UserPagination>(null);

const searchUser = async (): Promise<void> => {
	if (!searchEnabled.value) return;

	initial.value = false;
	fetching.value = true;
	userPickup.value = null;
	userPagination.value = null;
	searchedCounter.value++;

	const {
		userPickup: _userPickup,
		userPagination: _userPagination,
	} = _searchUser({
		query: inputSearchQuery.value,
		origin: inputSearchOrigin.value,
	});

	await sleep(500);

	userPagination.value = _userPagination;
	userPickup.value = await _userPickup;

	fetching.value = false;
};

const searchClear = (): void => {
	if (initial.value) return;
	if (fetching.value) return;

	initial.value = true;
	inputSearchQuery.value = '';
	inputSearchOrigin.value = 'combined';
	userPickup.value = null;
	userPagination.value = null;
};
</script>

<style lang="scss" module>
.fetching {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	gap: 16px;
	padding: 32px;
}

.fetchingIcon {
	font-size: 32px;
	opacity: 0.7;
}

.pickupUser {
	background: var(--panel);
	border-radius: var(--radius);
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
}
</style>
