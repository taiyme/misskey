<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<div class="_gaps">
		<MkInput v-model="inputSearchQuery" large autofocus type="search" @enter="searchNote">
			<template #prefix><i class="ti ti-search"></i></template>
		</MkInput>
		<MkFolder>
			<template #label>{{ i18n.ts.options }}</template>
			<div class="_gaps_s">
				<TmsBorderSection :active="inputSearchUser != null">
					<template #label>{{ i18n.ts.specifyUser }}</template>
					<template #button>
						<MkButton v-if="inputSearchUser != null" danger rounded inline @click="inputSearchUser = null">{{ i18n.ts.remove }}</MkButton>
						<MkButton v-else rounded inline @click="selectUser">{{ i18n.ts.selectUser }}</MkButton>
					</template>
					<div v-if="inputSearchUser != null" :class="$style.searchUser">
						<MkAvatar :user="inputSearchUser" :class="$style.searchUserAvatar" indicator/>
						<div :class="$style.searchUserBody">
							<MkUserName :user="inputSearchUser" :class="['_nowrap', $style.searchUserName]"/>
							<MkAcct :user="inputSearchUser" :class="['_nowrap', $style.searchUserAcct]" detail/>
						</div>
					</div>
				</TmsBorderSection>
				<div>
					<MkSwitch v-model="inputSearchLocalOnly">{{ i18n.ts.localOnly }}</MkSwitch>
				</div>
			</div>
		</MkFolder>
		<div class="_buttonsCenter">
			<MkButton v-if="!initial" large rounded :disabled="fetching" @click="searchClear">{{ i18n.ts.clear }}</MkButton>
			<MkButton large primary gradate rounded :disabled="!searchEnabled" @click="searchNote">{{ i18n.ts.search }}</MkButton>
		</div>
	</div>

	<template v-if="fetching">
		<div :class="$style.fetching">
			<MkLoading :class="$style.fetchingIcon" em/>
			<div>{{ i18n.ts.fetchingAsApObject }}<MkEllipsis/></div>
		</div>
	</template>
	<template v-else-if="initial">
		<MkInfo v-if="!notesSearchAvailable" warn>{{ i18n.ts.notesSearchNotAvailable }}</MkInfo>
		<MkInfo>{{ i18n.ts._tms.pickupAvailable + '\n' + i18n.ts._tms.pickupNoteDescription }}</MkInfo>
	</template>
	<template v-else-if="!notePickup && !notePagination">
		<div class="_fullinfo" style="padding: 32px;">
			<img :src="infoImageUrl" class="_ghost"/>
			<div>{{ i18n.ts.noNotes }}</div>
		</div>
	</template>
	<template v-else>
		<MkFoldableSection v-if="notePickup" expanded>
			<template #header>{{ i18n.ts._tms.pickup }}</template>
			<div :class="$style.pickupNote">
				<MkNote :key="notePickup.id" :note="notePickup"/>
			</div>
		</MkFoldableSection>
		<MkFoldableSection v-if="notePagination" expanded>
			<template #header>{{ i18n.ts.searchResult }}</template>
			<MkNotes :key="`search.note:${searchedCounter}`" :pagination="notePagination"/>
		</MkFoldableSection>
	</template>
</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type * as Misskey from 'misskey-js';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import MkNote from '@/components/MkNote.vue';
import MkNotes from '@/components/MkNotes.vue';
import MkInfo from '@/components/MkInfo.vue';
import TmsBorderSection from '@/components/TmsBorderSection.vue';
import { selectUser as _selectUser } from '@/os.js';
import { i18n } from '@/i18n.js';
import { useRouter } from '@/router.js';
import { $i } from '@/account.js';
import { instance, infoImageUrl } from '@/instance.js';
import { sleep } from '@/scripts/tms/promise.js';
import { searchNote as _searchNote, type NotePickup, type NotePagination } from '@/scripts/tms/search.js';

const notesSearchAvailable = !!(($i == null && (instance as any).policies.canSearchNotes) || ($i != null && $i.policies.canSearchNotes));

useRouter();

const initial = ref(true);
const fetching = ref(false);
const searchedCounter = ref(0);

const inputSearchQuery = ref('');
const inputSearchLocalOnly = ref(false);
const inputSearchUser = ref<Misskey.entities.UserDetailed | null>(null);

const searchEnabled = computed<boolean>(() => {
	if (fetching.value) return false;
	if (!inputSearchQuery.value.trim()) return false;
	return true;
});

const notePickup = ref<NotePickup>(null);
const notePagination = ref<NotePagination>(null);

const selectUser = (): void => {
	_selectUser().then(_user => {
		inputSearchUser.value = _user;
	});
};

const searchNote = async (): Promise<void> => {
	if (!searchEnabled.value) return;

	initial.value = false;
	fetching.value = true;
	notePickup.value = null;
	notePagination.value = null;
	searchedCounter.value++;

	const {
		notePickup: _notePickup,
		notePagination: _notePagination,
	} = _searchNote({
		query: inputSearchQuery.value,
		userId: inputSearchUser.value?.id,
		localOnly: inputSearchLocalOnly.value,
	});

	await sleep(500);

	if (notesSearchAvailable) {
		notePagination.value = _notePagination;
	}
	notePickup.value = await _notePickup;

	fetching.value = false;
};

const searchClear = (): void => {
	if (initial.value) return;
	if (fetching.value) return;

	initial.value = true;
	inputSearchQuery.value = '';
	inputSearchLocalOnly.value = false;
	inputSearchUser.value = null;
	notePickup.value = null;
	notePagination.value = null;
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

.searchUser {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px;
	font-size: 14px;
}

.searchUserBody {
	min-width: 0; // SEE: https://johnykei.net/front-end/css/flex-item-with-min-width-0-to-fix-overflowed-flexbox/
}

.searchUserAvatar {
	width: 45px;
	height: 45px;
}

.searchUserName {
	display: block;
	font-weight: bold;
}

.searchUserAcct {
	display: block;
	opacity: 0.5;
}

.pickupNote {
	background: var(--panel);
	border-radius: var(--radius);
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
}
</style>
