<template>
<MkModalWindow
	ref="dialog"
	:width="450"
	:can-close="false"
	:with-ok-button="true"
	:ok-button-disabled="false"
	@click="cancel()"
	@ok="ok()"
	@close="cancel()"
	@closed="emit('closed')"
>
	<template #header>
		{{ title }}
	</template>

	<MkSpacer :margin-min="20" :margin-max="32">
		<div class="xkpnjxcv _formRoot">
			<template v-for="item in Object.keys(form).filter(item => !form[item].hidden)" :key="item">
				<MkInput v-if="form[item].type === 'number'" v-model="values[item]" type="number" :step="form[item].step || 1" class="_formBlock">
					<template #label><span v-text="form[item].label || item"></span><span v-if="form[item].required === false"> ({{ i18n.ts.optional }})</span></template>
					<template v-if="form[item].description" #caption>{{ form[item].description }}</template>
				</MkInput>
				<MkInput v-else-if="form[item].type === 'string' && !form[item].multiline" v-model="values[item]" :max="form[item].max" type="text" class="_formBlock">
					<template #label><span v-text="form[item].label || item"></span><span v-if="form[item].required === false"> ({{ i18n.ts.optional }})</span></template>
					<template v-if="form[item].description" #caption>{{ form[item].description }}</template>
				</MkInput>
				<MkTextarea v-else-if="form[item].type === 'string' && form[item].multiline" v-model="values[item]" :max="form[item].max" class="_formBlock">
					<template #label><span v-text="form[item].label || item"></span><span v-if="form[item].required === false"> ({{ i18n.ts.optional }})</span></template>
					<template v-if="form[item].description" #caption>{{ form[item].description }}</template>
				</MkTextarea>
				<MkSwitch v-else-if="form[item].type === 'boolean'" v-model="values[item]" class="_formBlock">
					<span v-text="form[item].label || item"></span>
					<template v-if="form[item].description" #caption>{{ form[item].description }}</template>
				</MkSwitch>
				<MkSelect v-else-if="form[item].type === 'enum'" v-model="values[item]" class="_formBlock">
					<template #label><span v-text="form[item].label || item"></span><span v-if="form[item].required === false"> ({{ i18n.ts.optional }})</span></template>
					<option v-for="item_ in form[item].enum" :key="item_.value" :value="item_.value">{{ item_.label }}</option>
				</MkSelect>
				<MkRadios v-else-if="form[item].type === 'radio'" v-model="values[item]" class="_formBlock">
					<template #label><span v-text="form[item].label || item"></span><span v-if="form[item].required === false"> ({{ i18n.ts.optional }})</span></template>
					<option v-for="item_ in form[item].options" :key="item_.value" :value="item_.value">{{ item_.label }}</option>
				</MkRadios>
				<MkRange v-else-if="form[item].type === 'range'" v-model="values[item]" :min="form[item].min" :max="form[item].max" :step="form[item].step" :text-converter="form[item].textConverter" class="_formBlock">
					<template #label><span v-text="form[item].label || item"></span><span v-if="form[item].required === false"> ({{ i18n.ts.optional }})</span></template>
					<template v-if="form[item].description" #caption>{{ form[item].description }}</template>
				</MkRange>
				<MkButton v-else-if="form[item].type === 'button'" class="_formBlock" @click="form[item].action($event, values)">
					<span v-text="form[item].content || item"></span>
				</MkButton>
			</template>
		</div>
	</MkSpacer>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import MkInput from './form/input.vue';
import MkTextarea from './form/textarea.vue';
import MkSwitch from './form/switch.vue';
import MkSelect from './form/select.vue';
import MkRange from './form/range.vue';
import MkButton from './MkButton.vue';
import MkRadios from './form/radios.vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import { i18n } from '@/i18n';

const props = defineProps<{
	title: string;
	form: Record<string, any>;
}>();

const emit = defineEmits<{
	(ev: 'done', r: { canceled: false; result: Record<string, any>; }): void;
	(ev: 'done', r: { canceled: true; result: undefined; }): void;
	(ev: 'closed'): void;
}>();

const dialog = $ref<InstanceType<typeof MkModalWindow>>();

const values = $ref<Record<string, any>>({});

for (const item in props.form) {
	values[item] = props.form[item].default ?? null;
}

const ok = (): void => {
	emit('done', {
		canceled: false,
		result: values,
	});
	dialog?.close();
};

const cancel = (): void => {
	emit('done', {
		canceled: true,
		result: undefined,
	});
};
</script>
