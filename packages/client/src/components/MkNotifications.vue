<template>
<MkPagination ref="pagingComponent" :pagination="pagination">
	<template #empty>
		<div class="_fullinfo">
			<img src="https://xn--931a.moe/assets/info.jpg" class="_ghost"/>
			<div>{{ i18n.ts.noNotifications }}</div>
		</div>
	</template>

	<template #default="{ items: notifications }">
		<XList v-slot="{ item: notification }" class="elsfgstc" :items="notifications" :no-gap="true">
			<MkNote v-if="['reply', 'quote', 'mention'].includes(notification.type)" :key="notification.id" :note="notification.note"/>
			<MkNotification v-else :key="notification.id" :notification="notification" :with-time="true" :full="true" class="_panel notification"/>
		</XList>
	</template>
</MkPagination>
</template>

<script lang="ts" setup>
import { onUnmounted, onMounted, computed, ref } from 'vue';
import * as Misskey from 'misskey-js';
import MkPagination, { Paging } from '@/components/MkPagination.vue';
import MkNotification from '@/components/MkNotification.vue';
import XList from '@/components/MkDateSeparatedList.vue';
import MkNote from '@/components/MkNote.vue';
import { stream } from '@/stream';
import { $i } from '@/account';
import { i18n } from '@/i18n';

const props = defineProps<{
	includeTypes?: typeof Misskey.notificationTypes[number][] | null;
	unreadOnly?: boolean;
}>();

const pagingComponent = ref<InstanceType<typeof MkPagination>>();

const pagination: Paging = {
	endpoint: 'i/notifications' as const,
	limit: 10,
	params: computed(() => ({
		includeTypes: props.includeTypes ? props.includeTypes : undefined,
		excludeTypes: !props.includeTypes ? $i?.mutingNotificationTypes : undefined,
		unreadOnly: props.unreadOnly,
	})),
};

const onNotification = (notification: Misskey.entities.Notification): void => {
	const isMuted = props.includeTypes
		? !props.includeTypes.includes(notification.type)
		: !!$i?.mutingNotificationTypes.includes(notification.type);

	if (isMuted || document.visibilityState === 'visible') {
		stream.send('readNotification', {
			id: notification.id,
		});
	}

	if (!isMuted) {
		pagingComponent.value?.prepend({
			...notification,
			isRead: document.visibilityState === 'visible',
		});
	}
};

let connection: Misskey.ChannelConnection | null = null;

onMounted(() => {
	connection = stream.useChannel('main');
	connection.on('notification', onNotification);
	connection.on('readAllNotifications', () => {
		if (pagingComponent.value) {
			for (const item of pagingComponent.value.queue) {
				item.isRead = true;
			}
			for (const item of pagingComponent.value.items) {
				item.isRead = true;
			}
		}
	});
	connection.on('readNotifications', notificationIds => {
		if (pagingComponent.value) {
			for (let i = 0; i < pagingComponent.value.queue.length; i++) {
				if (notificationIds.includes(pagingComponent.value.queue[i].id)) {
					pagingComponent.value.queue[i].isRead = true;
				}
			}
			for (let i = 0; i < (pagingComponent.value.items || []).length; i++) {
				if (notificationIds.includes(pagingComponent.value.items[i].id)) {
					pagingComponent.value.items[i].isRead = true;
				}
			}
		}
	});
});

onUnmounted(() => {
	if (connection) {
		connection.dispose();
		connection = null;
	}
});
</script>

<style lang="scss" scoped>
.elsfgstc {
	background: var(--panel);
}
</style>
