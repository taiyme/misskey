<template>
<div class="_formRoot">
	<FormLink class="_formBlock" @click="configure"><template #icon><i class="ti ti-settings"></i></template>{{ i18n.ts.notificationSetting }}</FormLink>
	<FormSection>
		<FormLink class="_formBlock" @click="readAllNotifications">{{ i18n.ts.markAsReadAllNotifications }}</FormLink>
		<FormLink class="_formBlock" @click="readAllUnreadNotes">{{ i18n.ts.markAsReadAllUnreadNotes }}</FormLink>
		<FormLink class="_formBlock" @click="readAllMessagingMessages">{{ i18n.ts.markAsReadAllTalkMessages }}</FormLink>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { notificationTypes } from 'misskey-js';
import FormLink from '@/components/form/link.vue';
import FormSection from '@/components/form/section.vue';
import * as os from '@/os';
import { $i } from '@/account';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

const readAllUnreadNotes = async (): Promise<void> => {
	await os.api('i/read-all-unread-notes');
};

const readAllMessagingMessages = async (): Promise<void> => {
	await os.api('i/read-all-messaging-messages');
};

const readAllNotifications = async (): Promise<void> => {
	await os.api('notifications/mark-all-as-read');
};

const configure = (): void => {
	const includingTypes = notificationTypes.filter(x => !$i?.mutingNotificationTypes.includes(x));
	os.popup(defineAsyncComponent(() => import('@/components/MkNotificationSettingWindow.vue')), {
		includingTypes,
		showGlobalToggle: false,
	}, {
		done: async (res: {
			includingTypes: typeof notificationTypes[number][] | null;
		}) => {
			const { includingTypes: value } = res;
			await os.apiWithDialog('i/update', {
				mutingNotificationTypes: notificationTypes.filter(x => !value?.includes(x)),
			}).then(i => {
				if (!$i) return;
				$i.mutingNotificationTypes = i.mutingNotificationTypes;
			});
		},
	}, 'closed');
};

definePageMetadata({
	title: i18n.ts.notifications,
	icon: 'ti ti-bell',
});
</script>
