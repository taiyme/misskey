<template>
<MkStickyContainer>
	<template #header>
		<XHeader :actions="headerActions" :tabs="headerTabs"/>
	</template>
	<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
		<FormSuspense :p="init">
			<div class="_formRoot">
				<FormSection>
					<template #label>{{ i18n.ts._tms.customImage }}</template>

					<FormInput v-model="infoImageURL" type="url" class="_formBlock">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label>{{ i18n.ts._tms._customImage.info }}</template>
					</FormInput>
					<FormInput v-model="notFoundImageURL" type="url" class="_formBlock">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label>{{ i18n.ts._tms._customImage.notFound }}</template>
					</FormInput>
					<FormInput v-model="errorImageURL" type="url" class="_formBlock">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label>{{ i18n.ts._tms._customImage.error }}</template>
					</FormInput>
				</FormSection>
				<FormSection>
					<template #label>{{ i18n.ts._tms._customImage.pwaIcon }}</template>

					<MkSelect v-model="pwaIconType" class="_formBlock" @update:modelValue="onChangePWAIconType">
						<template #label>{{ i18n.ts._tms._customImage.pwaIconType }}</template>

						<option value="default">{{ i18n.ts._tms._customImage.default }}</option>
						<option value="themeColor">{{ i18n.ts._tms._customImage.themeColor }}</option>
						<option value="custom">{{ i18n.ts._tms._customImage.custom }}</option>
					</MkSelect>
					<FormInput v-model="pwaIcon192URL" type="url" class="_formBlock" :disabled="pwaIconType !== 'custom'">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label>{{ i18n.ts._tms._customImage.pwaIcon192 }}</template>
					</FormInput>
					<FormInput v-model="pwaIcon512URL" type="url" class="_formBlock" :disabled="pwaIconType !== 'custom'">
						<template #prefix><i class="ti ti-link"></i></template>
						<template #label>{{ i18n.ts._tms._customImage.pwaIcon512 }}</template>
					</FormInput>

					<FormRadios v-if="pwaIconType === 'themeColor'" v-model="themeColorIconType" @update:modelValue="onChangeThemeColorPreview">
						<template #label>{{ i18n.ts.preview }}</template>

						<option value="white">
							<img src="/static-assets/icons/mi-white192.png" :class="$style.image" :style="`background-color: ${themeColor};`"/>
						</option>
						<option value="green">
							<img src="/static-assets/icons/mi-green192.png" :class="$style.image" :style="`background-color: ${themeColor};`"/>
						</option>
					</FormRadios>
				</FormSection>
			</div>
		</FormSuspense>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { match } from 'ts-pattern';
import XHeader from './_header_.vue';
import FormSuspense from '@/components/form/suspense.vue';
import FormInput from '@/components/form/input.vue';
import FormRadios from '@/components/form/radios.vue';
import FormSection from '@/components/form/section.vue';
import MkSelect from '@/components/form/select.vue';
import { i18n } from '@/i18n';
import * as os from '@/os';
import { definePageMetadata } from '@/scripts/page-metadata';

let infoImageURL = $ref<string>('');
let notFoundImageURL = $ref<string>('');
let errorImageURL = $ref<string>('');

let pwaIconType = $ref<'default' | 'themeColor' | 'custom'>('default');
let pwaIcon192URL = $ref<string>('');
let pwaIcon512URL = $ref<string>('');

let themeColorIconType = $ref<'white' | 'green'>('white');

let themeColor = '';

type CustomImageResponse = {
	infoImageURL: string;
	notFoundImageURL: string;
	errorImageURL: string;
	pwaIcon192URL: string;
	pwaIcon512URL: string;
};

definePageMetadata({
	title: 'taiyme',
	icon: 'ti ti-settings',
});

const init = async (): Promise<void> => {
	const meta = await os.api('admin/meta');
	const customImage: CustomImageResponse = await os.apiGet('tms/custom-image/get');
	
	infoImageURL = customImage.infoImageURL;
	notFoundImageURL = customImage.notFoundImageURL;
	errorImageURL = customImage.errorImageURL;

	pwaIcon192URL = customImage.pwaIcon192URL;
	pwaIcon512URL = customImage.pwaIcon512URL;

	pwaIconType = match([pwaIcon192URL, pwaIcon512URL])
		.with(['/static-assets/icons/192.png', '/static-assets/icons/512.png'], () => 'default' as const)
		.with(['/static-assets/icons/mi-green192.png', '/static-assets/icons/mi-green512.png'], () => 'themeColor' as const)
		.with(['/static-assets/icons/mi-white192.png', '/static-assets/icons/mi-white512.png'], () => 'themeColor' as const)
		.otherwise(() => 'custom' as const);
	if (pwaIconType === 'themeColor') themeColorIconType = match([pwaIcon192URL, pwaIcon512URL])
			.with(['/static-assets/icons/mi-green192.png', '/static-assets/icons/mi-green512.png'], () => 'green' as const)
			.with(['/static-assets/icons/mi-white192.png', '/static-assets/icons/mi-white512.png'], () => 'white' as const)
			.otherwise(() => 'white' as const);

	themeColor = meta.themeColor || '#86b300';
};

const save = (): void => {
	os.apiWithDialog('tms/custom-image/update', {
		infoImageURL,
		notFoundImageURL,
		errorImageURL,
		pwaIcon192URL,
		pwaIcon512URL,
	}).then(() => {});
};

const onChangePWAIconType = (icontype: string): void => {
	const iconURLs = match(icontype)
		.with('default', () => ({ icon192: '/static-assets/icons/192.png', icon512: '/static-assets/icons/512.png' }))
		.with('themeColor', () => match(themeColorIconType)
			.with('white', () => ({ icon192: '/static-assets/icons/mi-white192.png', icon512: '/static-assets/icons/mi-white512.png' }))
			.with('green', () => ({ icon192: '/static-assets/icons/mi-green192.png', icon512: '/static-assets/icons/mi-green512.png' }))
			.exhaustive(),
		)
		.otherwise(() => ({ icon192: pwaIcon192URL, icon512: pwaIcon512URL }));

	pwaIcon192URL = iconURLs.icon192;
	pwaIcon512URL = iconURLs.icon512;
};

const onChangeThemeColorPreview = (color: string) => {
	const iconURLs = match(themeColorIconType)
		.with('white', () => ({ icon192: '/static-assets/icons/mi-white192.png', icon512: '/static-assets/icons/mi-white512.png' }))
		.with('green', () => ({ icon192: '/static-assets/icons/mi-green192.png', icon512: '/static-assets/icons/mi-green512.png' }))
		.exhaustive();

	pwaIcon192URL = iconURLs.icon192;
	pwaIcon512URL = iconURLs.icon512;
};

const headerActions = $computed(() => [{
	asFullButton: true,
	icon: 'ti ti-check',
	text: i18n.ts.save,
	handler: save,
}]);

const headerTabs = $computed(() => []);
</script>

<style lang="scss" module>
.image {
	border-radius: 50%;
	margin: 1rem;
}
</style>
