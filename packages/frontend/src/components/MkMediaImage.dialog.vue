<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="dialogEl"
	@click="dialogEl?.close()"
	@close="dialogEl?.close()"
	@closed="emit('closed')"
>
	<template #header>{{ i18n.ts._fileViewer.title }}</template>
	<template #default>
		<MkSpacer>
			<div class="_gaps">
				<MkKeyValue>
					<template #key>{{ i18n.ts.user }}</template>
					<template #value>
						<MkLoading v-if="fetchingOwnerUser"/>
						<MkA v-else-if="ownerUser" :to="userPage(ownerUser)">
							<MkUserCardMini :user="ownerUser" :withChart="false"/>
						</MkA>
						<span v-else style="opacity: 0.7;">({{ i18n.ts.unknown }})</span>
					</template>
				</MkKeyValue>
				<MkKeyValue>
					<template #key>{{ i18n.ts.description }}</template>
					<template #value>
						<span v-if="props.file.comment">{{ props.file.comment }}</span>
						<span v-else style="opacity: 0.7;">({{ i18n.ts.nothing }})</span>
					</template>
				</MkKeyValue>
				<MkKeyValue>
					<template #key>{{ i18n.ts._fileViewer.uploadedAt }}</template>
					<template #value><MkTime :time="props.file.createdAt" mode="detail"/></template>
				</MkKeyValue>
				<MkKeyValue>
					<template #key>{{ i18n.ts._fileViewer.type }}</template>
					<template #value>{{ props.file.type }}</template>
				</MkKeyValue>
				<MkKeyValue>
					<template #key>{{ i18n.ts._fileViewer.size }}</template>
					<template #value>{{ bytes(props.file.size) }}</template>
				</MkKeyValue>
				<MkKeyValue :copy="props.file.url">
					<template #key>{{ i18n.ts._fileViewer.url }}</template>
					<template #value>{{ props.file.url }}</template>
				</MkKeyValue>
			</div>
		</MkSpacer>
	</template>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { ref, shallowRef, watch } from 'vue';
import * as Misskey from 'misskey-js';
import { $i } from '@/account.js';
import { i18n } from '@/i18n.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import bytes from '@/filters/bytes.js';
import { userPage } from '@/filters/user.js';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import MkUserCardMini from '@/components/MkUserCardMini.vue';

const props = defineProps<{
	file: Misskey.entities.DriveFile;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

const dialogEl = shallowRef<InstanceType<typeof MkModalWindow> | null>(null);
const ownerUser = shallowRef<Misskey.entities.UserLite | null>(null);
const fetchingOwnerUser = ref(true);

const fetchOwnerUser = async (): Promise<void> => {
	if (ownerUser.value != null) {
		const newUserId = props.file.user?.id ?? props.file.userId;
		if (ownerUser.value.id === newUserId) {
			return;
		}
	}

	fetchingOwnerUser.value = true;

	const updateOwnerUser = (newUser: Misskey.entities.UserLite | null): void => {
		ownerUser.value = newUser;
		fetchingOwnerUser.value = false;
	};

	if (props.file.user != null) {
		return updateOwnerUser(props.file.user);
	}

	if (props.file.userId != null) {
		if (props.file.userId === $i?.id) {
			return updateOwnerUser($i);
		}
		return updateOwnerUser(await misskeyApi('users/show', { userId: props.file.userId }).catch(() => null));
	}

	updateOwnerUser(null);
};

watch(() => [props.file.user, props.file.userId], fetchOwnerUser, { immediate: true, deep: true });
</script>
