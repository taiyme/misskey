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
import FormSection from '@/components/form/section.vue';
import MkSelect from '@/components/form/select.vue';
import { i18n } from '@/i18n';
import * as os from '@/os';
import { definePageMetadata } from '@/scripts/page-metadata';

let infoImageURL = $ref<string>('');
let notFoundImageURL = $ref<string>('');
let errorImageURL = $ref<string>('');

let pwaIconType = $ref<'default' | 'custom'>('default');
let pwaIcon192URL = $ref<string>('');
let pwaIcon512URL = $ref<string>('');

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
	const customImage: CustomImageResponse = await os.apiGet('tms/custom-image/get');
	
	infoImageURL = customImage.infoImageURL;
	notFoundImageURL = customImage.notFoundImageURL;
	errorImageURL = customImage.errorImageURL;

	pwaIcon192URL = customImage.pwaIcon192URL;
	pwaIcon512URL = customImage.pwaIcon512URL;

	pwaIconType = match([pwaIcon192URL, pwaIcon512URL])
		.with(['/static-assets/icons/192.png', '/static-assets/icons/512.png'], () => 'default' as const)
		.otherwise(() => 'custom' as const);
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
		.otherwise(() => ({ icon192: '', icon512: '' }));

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
