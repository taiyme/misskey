<template>
<div class="ddiqwdnk">
	<MkWidgets class="widgets" :edit="editMode" :widgets="defaultStore.reactiveState.widgets.value.filter(w => w.place === place)" @add-widget="addWidget" @remove-widget="removeWidget" @update-widget="updateWidget" @update-widgets="updateWidgets" @exit="editMode = false"/>
	<MkAd class="a" :prefer="['square']"/>

	<button v-if="editMode" class="_textButton edit" style="font-size: 0.9em;" @click="editMode = false"><i class="ti ti-check"></i> {{ i18n.ts.editWidgetsExit }}</button>
	<button v-else class="_textButton edit" style="font-size: 0.9em;" @click="editMode = true"><i class="ti ti-pencil"></i> {{ i18n.ts.editWidgets }}</button>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkWidgets from '@/components/MkWidgets.vue';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';

export default defineComponent({
	components: {
		MkWidgets,
	},

	props: {
		place: {
			type: String,
		},
	},

	emits: ['mounted'],

	data() {
		return {
			editMode: false,
			defaultStore,
			i18n,
		};
	},

	mounted() {
		this.$emit('mounted', this.$el);
	},

	methods: {
		addWidget(widget) {
			defaultStore.set('widgets', [{
				...widget,
				place: this.place,
			}, ...defaultStore.state.widgets]);
		},

		removeWidget(widget) {
			defaultStore.set('widgets', defaultStore.state.widgets.filter(w => w.id !== widget.id));
		},

		updateWidget({ id, data }) {
			defaultStore.set('widgets', defaultStore.state.widgets.map(w => w.id === id ? {
				...w,
				data,
			} : w));
		},

		updateWidgets(widgets) {
			defaultStore.set('widgets', [
				...defaultStore.state.widgets.filter(w => w.place !== this.place),
				...widgets,
			]);
		},
	},
});
</script>

<style lang="scss" scoped>
.ddiqwdnk {
	position: sticky;
	height: min-content;
	box-sizing: border-box;
	padding-bottom: 8px;

	> .widgets,
	> .a {
		width: 300px;
	}

	> .edit {
		display: block;
		margin: 16px auto;
	}
}
</style>
