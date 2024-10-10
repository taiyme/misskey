<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, '_gaps_m']">
	<div class="_gaps_s">
		<MkInfo>{{ i18n.ts.headlineMisskey }}</MkInfo>
		<MkInfo warn>{{ i18n.ts.headlineMisskey }}</MkInfo>
	</div>
	<MkInput v-model="textRef" :disabled="disabledRef">
		<template #label>{{ i18n.ts.text }}</template>
	</MkInput>
	<MkSwitch v-model="switchRef" :disabled="disabledRef">
		<template #label>{{ switchRef ? i18n.ts.itsOn : i18n.ts.itsOff }}</template>
	</MkSwitch>
	<div class="_buttons">
		<MkRadio v-model="optionRef" :disabled="disabledRef" value="taiy">taiy</MkRadio>
		<MkRadio v-model="optionRef" :disabled="disabledRef" value="cffnpwr">cffnpwr</MkRadio>
		<MkRadio v-model="optionRef" :disabled="disabledRef" value="souhait">souhait</MkRadio>
	</div>
	<div class="_buttons">
		<MkButton gradate :disabled="disabledRef">{{ i18n.ts.note }}</MkButton>
		<MkButton primary :disabled="disabledRef">{{ i18n.ts.note }}</MkButton>
		<MkButton :disabled="disabledRef">{{ i18n.ts.close }}</MkButton>
		<MkButton transparent :disabled="disabledRef">{{ i18n.ts.cancel }}</MkButton>
		<MkButton danger primary :disabled="disabledRef">{{ i18n.ts.delete }}</MkButton>
		<MkButton danger :disabled="disabledRef">{{ i18n.ts.update }}</MkButton>
		<MkButton asLike primary :disabled="disabledRef"><i class="ti ti-heart"></i></MkButton>
		<MkButton asLike :disabled="disabledRef"><i class="ti ti-heart"></i></MkButton>
	</div>
	<div :inert="disabledRef" :style="disabledRef ? 'opacity: 0.7;' : ''">
		<Mfm :text="mfmRef"/>
	</div>
	<div class="_buttons">
		<MkButton primary :disabled="disabledRef" @click="openMenu">Open menu</MkButton>
		<MkButton primary :disabled="disabledRef" @click="openDialog">Open dialog</MkButton>
		<MkButton primary :disabled="disabledRef" @click="openForm">Open form</MkButton>
		<MkButton primary :disabled="disabledRef" @click="openDrive">Open drive</MkButton>
	</div>
	<MkSwitch v-model="disabledRef">
		<template #label>{{ disabledRef ? i18n.ts.enableAll : i18n.ts.disableAll }}</template>
	</MkSwitch>
</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { url } from '@@/js/config.js';
import { $i } from '@/account.js';
import { i18n } from '@/i18n.js';
import { alert, form, popupMenu, selectDriveFile } from '@/os.js';
import MkButton from '@/components/MkButton.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkInput from '@/components/MkInput.vue';
import MkRadio from '@/components/MkRadio.vue';
import MkSwitch from '@/components/MkSwitch.vue';

const disabledRef = ref(false);

const textRef = ref('');
const switchRef = ref(true);
const optionRef = ref<'taiy' | 'cffnpwr' | 'souhait'>('taiy');
const mfmRef = computed(() => {
	return [
		`Hello world! This is an @example@example.com mention. BTW you are @${$i?.username ?? 'guest'}.`,
		`Also, here is ${url} and [example link](${url}). for more details, see https://misskey-hub.net/docs/for-users/.`,
		'As you know #taiyme is open-source software.',
	].join('\n');
});

const openMenu = (ev: MouseEvent) => {
	popupMenu([{
		type: 'label',
		text: 'Fruits',
	}, {
		text: 'Create some apples',
		action: () => {},
	}, {
		text: 'Read some oranges',
		action: () => {},
	}, {
		text: 'Update some melons',
		action: () => {},
	}, {
		text: 'Delete some bananas',
		danger: true,
		action: () => {},
	}], ev.currentTarget ?? ev.target);
};

const openDialog = () => {
	alert({
		type: 'warning',
		title: 'Oh my Aichan',
		text: 'Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
	});
};

const openForm = () => {
	form('Example form', {
		foo: {
			type: 'boolean',
			default: true,
			label: 'This is a boolean property',
		},
		bar: {
			type: 'number',
			default: 300,
			label: 'This is a number property',
		},
		baz: {
			type: 'string',
			default: 'taiyme makes you happy.',
			label: 'This is a string property',
		},
	});
};

const openDrive = () => {
	selectDriveFile(false);
};
</script>

<style lang="scss" module>
.root {
	padding: 16px;
}
</style>
