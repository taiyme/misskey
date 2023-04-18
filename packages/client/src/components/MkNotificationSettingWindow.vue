<template>
<MkModalWindow
	ref="dialog"
	:width="400"
	:height="450"
	:with-ok-button="true"
	:ok-button-disabled="false"
	@ok="ok()"
	@close="dialog?.close()"
	@closed="emit('closed')"
>
	<template #header>{{ i18n.ts.notificationSetting }}</template>
	<div class="_monolithic_">
		<div v-if="showGlobalToggle" class="_section">
			<MkSwitch v-model="useGlobalSetting">
				{{ i18n.ts.useGlobalSetting }}
				<template #caption>{{ i18n.ts.useGlobalSettingDesc }}</template>
			</MkSwitch>
		</div>
		<div v-if="!useGlobalSetting" class="_section">
			<MkInfo>{{ i18n.ts.notificationSettingDesc }}</MkInfo>
			<MkButton inline @click="disableAll">{{ i18n.ts.disableAll }}</MkButton>
			<MkButton inline @click="enableAll">{{ i18n.ts.enableAll }}</MkButton>
			<MkSwitch v-for="ntype in notificationTypes" :key="ntype" v-model="typesMap[ntype]">{{ i18n.t(`_notification._types.${ntype}`) }}</MkSwitch>
		</div>
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { notificationTypes } from 'misskey-js';
import MkSwitch from './form/switch.vue';
import MkInfo from './MkInfo.vue';
import MkButton from './MkButton.vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import { i18n } from '@/i18n';
import { typedEntries } from '@/scripts/tms/utils';

type NotificationType = typeof notificationTypes[number];

const emit = defineEmits<{
	(ev: 'done', v: { includingTypes: NotificationType[] | null }): void,
	(ev: 'closed'): void,
}>();

const props = withDefaults(defineProps<{
	includingTypes?: NotificationType[] | null;
	showGlobalToggle?: boolean;
}>(), {
	includingTypes: () => [],
	showGlobalToggle: true,
});

const includingTypes = $computed(() => props.includingTypes || []);

const dialog = $ref<InstanceType<typeof MkModalWindow>>();

const typesMap = $ref({} as Record<NotificationType, boolean>);

const useGlobalSetting = $ref((includingTypes === null || includingTypes.length === 0) && props.showGlobalToggle);

for (const ntype of notificationTypes) {
	typesMap[ntype] = includingTypes.includes(ntype);
}

const ok = (): void => {
	if (useGlobalSetting) {
		emit('done', { includingTypes: null });
	} else {
		emit('done', {
			includingTypes: typedEntries($$(typesMap).value).flatMap(([type, bool]) => bool ? [type] : []),
		});
	}

	dialog?.close();
};

const disableAll = (): void => {
	for (const type in typesMap) {
		typesMap[type] = false;
	}
};

const enableAll = (): void => {
	for (const type in typesMap) {
		typesMap[type] = true;
	}
};
</script>
