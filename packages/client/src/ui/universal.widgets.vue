<template>
<div class="efzpzdvf">
	<MkWidgets :edit="editMode" :widgets="defaultStore.reactiveState.widgets.value" @add-widget="addWidget" @remove-widget="removeWidget" @update-widget="updateWidget" @update-widgets="updateWidgets" @exit="editMode = false"/>

	<button v-if="editMode" class="_textButton" style="font-size: 0.9em;" @click="editMode = false"><i class="ti ti-check"></i> {{ i18n.ts.editWidgetsExit }}</button>
	<button v-else class="_textButton mk-widget-edit" style="font-size: 0.9em;" @click="editMode = true"><i class="ti ti-pencil"></i> {{ i18n.ts.editWidgets }}</button>
</div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import MkWidgets, { Widget, EditedWidget } from '@/components/MkWidgets.vue';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';

const emit = defineEmits<{
	(ev: 'mounted', el: HTMLElement | null): void;
}>();

let editMode = $ref(false);
const rootEl = $ref<HTMLDivElement>();

onMounted(() => {
	emit('mounted', rootEl ?? null);
});

const addWidget = (widget: Widget): void => {
	defaultStore.set('widgets', [{
		...widget,
		place: null,
	}, ...defaultStore.state.widgets]);
};

const removeWidget = (widget: Widget): void => {
	defaultStore.set('widgets', defaultStore.state.widgets.filter(w => w.id !== widget.id));
};

const updateWidget = ({ id, data }: EditedWidget): void => {
	defaultStore.set('widgets', defaultStore.state.widgets.map(w => w.id === id ? {
		...w,
		data,
	} : w));
};

const updateWidgets = (widgets: Widget[]): void => {
	defaultStore.set('widgets', widgets);
};
</script>

<style lang="scss" scoped>
.efzpzdvf {
	position: sticky;
	height: min-content;
	min-height: calc(var(--vh, 1vh) * 100); // fallback (dvh units)
	min-height: 100dvh;
	padding: var(--margin) 0;
	box-sizing: border-box;

	> * {
		margin: var(--margin) 0;
		width: 300px;

		&:first-child {
			margin-top: 0;
		}
	}

	> .add {
		margin: 0 auto;
	}
}
</style>
