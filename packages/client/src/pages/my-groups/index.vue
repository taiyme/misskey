<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="800" :margin-min="20">
		<div v-if="tab === 'owned'" class="_contents">
			<MkButton primary style="margin: 0 auto var(--margin) auto;" @click="create"><i class="ti ti-plus"></i> {{ i18n.ts.createGroup }}</MkButton>
			<MkPagination v-slot="{items}" ref="owned" :pagination="ownedPagination">
				<div v-for="group in items" :key="group.id" class="_card">
					<div class="_title"><MkA :to="`/my/groups/${ group.id }`" class="_link">{{ group.name }}</MkA></div>
					<div class="_content">
						<MkAvatars :user-ids="group.userIds"/>
					</div>
				</div>
			</MkPagination>
		</div>
		<div v-else-if="tab === 'joined'" class="_contents">
			<MkPagination v-slot="{items}" ref="joined" :pagination="joinedPagination">
				<div v-for="group in items" :key="group.id" class="_card">
					<div class="_title">{{ group.name }}</div>
					<div class="_content">
						<MkAvatars :user-ids="group.userIds"/>
					</div>
					<div class="_footer">
						<MkButton danger @click="leave(group)">{{ i18n.ts.leaveGroup }}</MkButton>
					</div>
				</div>
			</MkPagination>
		</div>
		<div v-else-if="tab === 'invites'" class="_contents">
			<MkPagination v-slot="{items}" ref="invitations" :pagination="invitationPagination">
				<div v-for="invitation in items" :key="invitation.id" class="_card">
					<div class="_title">{{ invitation.group.name }}</div>
					<div class="_content">
						<MkAvatars :user-ids="invitation.group.userIds"/>
					</div>
					<div class="_footer">
						<MkButton primary inline @click="acceptInvite(invitation)"><i class="ti ti-check"></i> {{ i18n.ts.accept }}</MkButton>
						<MkButton primary inline @click="rejectInvite(invitation)"><i class="ti ti-x"></i> {{ i18n.ts.reject }}</MkButton>
					</div>
				</div>
			</MkPagination>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>
	
<script lang="ts" setup>
import { computed, ref } from 'vue';
import MkPagination from '@/components/MkPagination.vue';
import MkButton from '@/components/MkButton.vue';
import MkAvatars from '@/components/MkAvatars.vue';
import * as os from '@/os';
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';
import MkStickyContainer from '@/components/global/MkStickyContainer.vue';

const owned = ref('owned');
const joined = ref('joined');
const invitations = ref('invitations');

let tab = $ref('owned');

const ownedPagination = {
	endpoint: 'users/groups/owned' as const,
	limit: 10,
};
const joinedPagination = {
	endpoint: 'users/groups/joined' as const,
	limit: 10,
};
const invitationPagination = {
	endpoint: 'i/user-group-invites' as const,
	limit: 10,
};

const headerActions = $computed(() => [{
	icon: 'ti ti-plus',
	text: i18n.ts.createGroup,
	handler: create,
}]);

const headerTabs = $computed(() => [{
	key: 'owned',
	title: i18n.ts.ownedGroups,
	icon: 'ti ti-crown',
}, {
	key: 'joined',
	title: i18n.ts.joinedGroups,
	icon: 'ti ti-id-badge',
}, {
	key: 'invites',
	title: i18n.ts.invites,
	icon: 'ti ti-inbox',
}]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.groups,
		icon: 'ti ti-users',
	})),
);

async function create() {
	const { canceled, result: name } = await os.inputText({
		title: i18n.ts.groupName,
	});

	if (canceled) return;

	await os.api('users/groups/create', { name: name });
	owned.value.reload();
	os.success();
}

async function leave(group) {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.t('leaveGroupConfirm', { name: group.name }),
	});

	if (canceled) return;

	os.apiWithDialog('users/groups/leave', {
		groupId: group.id,
	}).then(() => {
		joined.value.reload();
	});
}

async function acceptInvite(invitation) {
	os.api('users/groups/invitations/accept', {
		invitationId: invitation.id,
	}).then(() => {
		os.success();
		invitations.value.reload();
		joined.value.reload();
	});
}

async function rejectInvite(invitation) {
	os.api('users/groups/invitations/reject', {
		invitationId: invitation.id,
	}).then(() => {
		invitations.value.reload();
	});
}
</script>

<style lang="scss" scoped>
._card {
	margin-bottom: 1rem;

	._title {
		font-size: 1.2rem;
		font-weight: bold;
	}

	._content {
		margin: 1rem 0;
	}

	._footer {
		display: flex;
		justify-content: flex-end;
	}
}
</style>
