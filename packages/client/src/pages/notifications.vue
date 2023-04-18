<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="800">
		<div v-if="tab === 'all' || tab === 'unread'">
			<MkNotifications class="notifications" :include-types="includeTypes ?? []" :unread-only="unreadOnly"/>
		</div>
		<div v-else-if="tab === 'mentions'">
			<MkNotes :pagination="mentionsPagination"/>
		</div>
		<div v-else-if="tab === 'directNotes'">
			<MkNotes :pagination="directNotesPagination"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { notificationTypes } from 'misskey-js';
import MkNotifications from '@/components/MkNotifications.vue';
import MkNotes from '@/components/MkNotes.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import { getHtmlElementFromEvent } from '@/scripts/tms/utils';

let tab = $ref('all');
let includeTypes = $ref<typeof notificationTypes[number][] | null>(null);
let unreadOnly = $computed(() => tab === 'unread');

const mentionsPagination = {
	endpoint: 'notes/mentions' as const,
	limit: 10,
};

const directNotesPagination = {
	endpoint: 'notes/mentions' as const,
	limit: 10,
	params: {
		visibility: 'specified',
	},
};

const setFilter = (ev: MouseEvent): void => {
	const el = getHtmlElementFromEvent(ev) ?? undefined;
	const typeItems = notificationTypes.map(t => ({
		text: i18n.t(`_notification._types.${t}`),
		active: !!includeTypes?.includes(t),
		action: (): void => {
			includeTypes = [t];
		},
	}));
	const items = includeTypes != null ? [{
		icon: 'ti ti-x',
		text: i18n.ts.clear,
		action: (): void => {
			includeTypes = null;
		},
	}, null, ...typeItems] : typeItems;
	os.popupMenu(items, el);
};

const headerActions = $computed(() => [tab === 'all' ? {
	text: i18n.ts.filter,
	icon: 'ti ti-filter',
	highlighted: includeTypes != null,
	handler: setFilter,
} : undefined, tab === 'all' ? {
	text: i18n.ts.markAllAsRead,
	icon: 'ti ti-check',
	handler: (): void => {
		os.apiWithDialog('notifications/mark-all-as-read');
	},
} : undefined].filter(x => x !== undefined));

const headerTabs = $computed(() => [{
	key: 'all',
	title: i18n.ts.all,
}, {
	key: 'unread',
	title: i18n.ts.unread,
}, {
	key: 'mentions',
	title: i18n.ts.mentions,
	icon: 'ti ti-at',
}, {
	key: 'directNotes',
	title: i18n.ts.directNotes,
	icon: 'ti ti-mail',
}]);

definePageMetadata(computed(() => ({
	title: i18n.ts.notifications,
	icon: 'ti ti-bell',
})));
</script>
