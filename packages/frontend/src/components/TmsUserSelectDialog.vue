<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="dialogEl"
	:withOkButton="true"
	:okButtonDisabled="selectedUser == null"
	@click="cancel()"
	@close="cancel()"
	@ok="ok()"
	@closed="emit('closed')"
>
	<template #header>{{ i18n.ts.selectUser }}</template>
	<div class="_gaps _margin">
		<div :class="$style.form">
			<FormSplit :minWidth="128">
				<MkInput v-model="inputUserName" :autofocus="true" :debounce="false" @update:modelValue="debouncedSearch">
					<template #label>{{ i18n.ts.username }}</template>
					<template #prefix>@</template>
				</MkInput>
				<MkInput v-model="inputHostName" :debounce="false" :datalist="[hostname]" @update:modelValue="debouncedSearch">
					<template #label>{{ i18n.ts.host }}</template>
					<template #prefix>@</template>
				</MkInput>
			</FormSplit>
		</div>
		<div class="_gaps">
			<div
				:class="['_button', $style.matchUser]"
				@click="showMatchUser ? matchUserSelect() : lookupUserSelect()"
			>
				<template v-if="showMatchUser">
					<div>{{ i18n.ts.lookup }}:</div>
					<div><MkAcct :user="matchUser" detail/></div>
				</template>
				<template v-else>
					<div>{{ i18n.ts.lookup }}<MkEllipsis static/></div>
				</template>
			</div>
			<div>
				<XUser
					v-if="selectedUser && !hasSelectedUser"
					:key="selectedUser.id"
					:user="selectedUser"
					:selected="true"
					@select="select"
				/>
				<div v-if="computedResult.type === 'empty'" class="_fullinfo">
					<img :src="infoImageUrl" class="_ghost"/>
					<div>{{ i18n.ts.noUsers }}</div>
				</div>
				<template v-else-if="computedResult.type === 'wait'">
					<MkLoading/>
				</template>
				<template v-else>
					<XUser
						v-for="resultUser in computedResult.users"
						:key="resultUser.id"
						:user="resultUser"
						:selected="selectedUser?.id === resultUser.id"
						@select="select"
					/>
				</template>
			</div>
		</div>
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { type Ref, computed, defineAsyncComponent, onMounted, ref, shallowRef } from 'vue';
import * as Misskey from 'misskey-js';
import { debounce } from 'throttle-debounce';
import * as os from '@/os.js';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';
import { $i } from '@/account.js';
import { hostname } from '@/config.js';
import { infoImageUrl } from '@/instance.js';
import { checkHttpOrHttps } from '@/scripts/tms/check-url.js';
import MkInput from '@/components/MkInput.vue';
import FormSplit from '@/components/form/split.vue';
import MkModalWindow from '@/components/MkModalWindow.vue';

const XUser = defineAsyncComponent(() => import('@/components/TmsUserSelectDialog.user.vue'));

const props = withDefaults(defineProps<{
	includeSelf?: boolean;
}>(), {
	includeSelf: true,
});

const emit = defineEmits<{
	ok: [selected: Misskey.entities.UserDetailed];
	cancel: [];
	closed: [];
}>();

const dialogEl = shallowRef<InstanceType<typeof MkModalWindow>>();

//#region select, handler
const selectedUser: Ref<Misskey.entities.UserDetailed | null> = ref(null);

const select = (selectUser: Misskey.entities.UserDetailed): void => {
	if (selectedUser.value?.id === selectUser.id) {
		selectedUser.value = null;
	} else {
		selectedUser.value = selectUser;
	}
};

const ok = (): void => {
	if (selectedUser.value == null) return;

	emit('ok', selectedUser.value);
	dialogEl.value?.close();
	updateRecentlyUsedUsers(selectedUser.value);
};

const cancel = (): void => {
	emit('cancel');
	dialogEl.value?.close();
};
//#endregion

//#region matchUser
const matchUser = computed(() => {
	const trimmedUserName = inputUserName.value.trim();
	const trimmedHostName = inputHostName.value.trim();
	return {
		username: trimmedUserName,
		host: (!trimmedHostName || trimmedHostName === hostname) ? null : trimmedHostName,
	};
});
const showMatchUser = computed(() => {
	return inputUserName.value !== '';
});

const onRejected = (err: unknown): void => {
	const { id, message } = err as {
		id: string;
		message: string;
	};
	os.alert({
		type: 'error',
		text: `${message}\n${id}`,
	});
};

const matchUserSelect = async (): Promise<void> => {
	const { username, host } = matchUser.value;
	os.api('users/show', {
		username,
		host: host ?? undefined,
	}).then(matchedUser => {
		select(matchedUser);
	}).catch(onRejected);
};

const lookupUserSelect = async (): Promise<void> => {
	const { canceled, result: rawInputResult } = await os.inputText({
		title: i18n.ts.usernameOrUserId,
	});
	if (canceled) return;
	const inputResult = rawInputResult.trim();
	if (inputResult === '') return;

	if (checkHttpOrHttps(inputResult)) {
		const promiseFromAp = os.api('ap/show', {
			uri: inputResult,
		});
		os.promiseDialog(promiseFromAp, null, null, i18n.ts.fetchingAsApObject);

		promiseFromAp.then(res => {
			if (res.type === 'User') {
				select(res.object);
			} else {
				os.alert({
					type: 'error',
					text: `${inputResult} is not User.`,
				});
			}
		}).catch(onRejected);
	} else {
		const { username, host } = Misskey.acct.parse(inputResult);
		const userId = inputResult;
		const promiseFromUsername = os.api('users/show', { username, host: host ?? undefined });
		const promiseFromUserId = os.api('users/show', { userId });

		const promiseFromAll = Promise.allSettled([promiseFromUsername, promiseFromUserId]);
		os.promiseDialog(promiseFromAll, null, null, i18n.ts.fetchingAsApObject);

		promiseFromAll.then(results => {
			let resolved = false;
			let rejected = false;
			for (const result of results) {
				if (!resolved && result.status === 'fulfilled') {
					resolved = true;
					select(result.value);
					break;
				}
			}
			if (!resolved) {
				for (const result of results) {
					if (!rejected && result.status === 'rejected') {
						rejected = true;
						onRejected(result.reason);
						break;
					}
				}
			}
		});
	}
};
//#endregion

//#region searchUsers
const searchUsers: Ref<Misskey.entities.UserDetailed[] | null> = ref(null);

const inputUserName = ref('');
const inputHostName = ref('');

const search = (): void => {
	searchUsers.value = null;
	const trimmedUserName = inputUserName.value.trim();
	const trimmedHostName = inputHostName.value.trim();
	if (trimmedUserName === '' && trimmedHostName === '') return;

	os.api('users/search-by-username-and-host', {
		username: trimmedUserName,
		host: trimmedHostName,
		limit: 16,
		detail: true,
	}).then(users => {
		searchUsers.value = (users as Misskey.entities.UserDetailed[]);
	});
};

const debouncedSearch = debounce(1000, search);
//#endregion

//#region recentUsers
const recentUsers: Ref<Misskey.entities.UserDetailed[] | null> = ref(null);

onMounted(() => {
	os.api('users/show', {
		userIds: defaultStore.state.recentlyUsedUsers,
	}).then(users => {
		if (props.includeSelf && $i && !users.some(x => x.id === $i?.id)) {
			recentUsers.value = [$i, ...users];
		} else {
			recentUsers.value = users;
		}
	});
});

const updateRecentlyUsedUsers = (newUser: Misskey.entities.UserDetailed): string[] => {
	const userIds = [...new Set([newUser.id, ...defaultStore.state.recentlyUsedUsers])].splice(0, 16);
	defaultStore.set('recentlyUsedUsers', userIds);
	return userIds;
};
//#endregion

//#region resultUsers
type ComputedResult = {
	type: 'search';
	users: Misskey.entities.UserDetailed[];
} | {
	type: 'recent';
	users: Misskey.entities.UserDetailed[];
} | {
	type: 'empty';
} | {
	type: 'wait';
};
const computedResult = computed<ComputedResult>(() => {
	const trimmedUserName = inputUserName.value.trim();
	const trimmedHostName = inputHostName.value.trim();
	if (trimmedUserName !== '' || trimmedHostName !== '') {
		if (searchUsers.value) {
			return {
				type: 'search',
				users: searchUsers.value,
			};
		} else {
			return {
				type: 'wait',
			};
		}
	}
	if (recentUsers.value == null) {
		return {
			type: 'wait',
		};
	}
	if (recentUsers.value.length !== 0) {
		return {
			type: 'recent',
			users: recentUsers.value,
		};
	}
	return {
		type: 'empty',
	};
});

const hasSelectedUser = computed(() => {
	if (selectedUser.value == null) return false;
	if (computedResult.value.type === 'empty') return false;
	if (computedResult.value.type === 'wait') return false;
	return computedResult.value.users.some(resultUser => selectedUser.value?.id === resultUser.id);
});
//#endregion
</script>

<style lang="scss" module>
.form {
	padding: 0 var(--root-margin);
}

.matchUser {
	display: flex;
	flex-direction: column;
	margin: 0px var(--root-margin) 8px;
	padding: 8px 16px;
	border-radius: var(--radius);
	background-color: var(--infoBg);
	color: var(--infoFg);
	font-size: 14px;
}
</style>
