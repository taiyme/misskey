<template>
<MkContainer :style="`height: ${widgetProps.height}px;`" :show-header="widgetProps.showHeader" :scrollable="true" class="mkw-notifications">
	<template #header><i class="ti ti-bell"></i>{{ i18n.ts.notifications }}</template>
	<template #func><button class="_button" @click="configureNotification()"><i class="ti ti-settings"></i></button></template>

	<div>
		<MkNotifications :include-types="widgetProps.includingTypes"/>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { notificationTypes } from 'misskey-js';
import { useWidgetPropsManager, Widget, WidgetComponentExpose } from './widget';
import { GetFormResultType } from '@/scripts/form';
import MkContainer from '@/components/MkContainer.vue';
import MkNotifications from '@/components/MkNotifications.vue';
import * as os from '@/os';
import { i18n } from '@/i18n';

const name = 'notifications';

const widgetPropsDef = {
	showHeader: {
		type: 'boolean' as const,
		default: true,
	},
	height: {
		type: 'number' as const,
		default: 300,
	},
	includingTypes: {
		type: 'array' as const,
		hidden: true as const,
		default: null,
	},
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

// 現時点ではvueの制限によりimportしたtypeをジェネリックに渡せない
//const props = defineProps<WidgetComponentProps<WidgetProps>>();
//const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();
const props = defineProps<{
	widget?: Widget<WidgetProps>;
}>();

const emit = defineEmits<{
	(ev: 'updateProps', props_: WidgetProps);
}>();

const { widgetProps, configure, save } = useWidgetPropsManager(name,
	widgetPropsDef,
	props,
	emit,
);

const configureNotification = (): void => {
	os.popup(defineAsyncComponent(() => import('@/components/MkNotificationSettingWindow.vue')), {
		includingTypes: widgetProps.includingTypes,
	}, {
		done: async (res: {
			includingTypes: typeof notificationTypes[number][] | null;
		}) => {
			const { includingTypes } = res;
			widgetProps.includingTypes = includingTypes;
			save();
		},
	}, 'closed');
};

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>
