<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<FormSuspense :p="init">
		<div class="_gaps_m">
			<MkRadios v-model="provider">
				<option :value="null">{{ i18n.ts.none }} ({{ i18n.ts.notRecommended }})</option>
				<option value="hcaptcha">hCaptcha</option>
				<option value="recaptcha">reCAPTCHA</option>
				<option value="turnstile">Turnstile</option>
			</MkRadios>

			<template v-if="provider === 'hcaptcha'">
				<MkInput type="text" v-model="hcaptchaSiteKey" nullable>
					<template #prefix><i class="ti ti-key"></i></template>
					<template #label>{{ i18n.ts.hcaptchaSiteKey }}</template>
				</MkInput>
				<MkInput type="text" v-model="hcaptchaSecretKey" nullable>
					<template #prefix><i class="ti ti-key"></i></template>
					<template #label>{{ i18n.ts.hcaptchaSecretKey }}</template>
				</MkInput>
				<FormSlot>
					<template #label>{{ i18n.ts.preview }}</template>
					<MkCaptcha provider="hcaptcha" :sitekey="hcaptchaSiteKey || '10000000-ffff-ffff-ffff-000000000001'"/>
				</FormSlot>
			</template>
			<template v-else-if="provider === 'recaptcha'">
				<MkInput type="text" v-model="recaptchaSiteKey" nullable>
					<template #prefix><i class="ti ti-key"></i></template>
					<template #label>{{ i18n.ts.recaptchaSiteKey }}</template>
				</MkInput>
				<MkInput type="text" v-model="recaptchaSecretKey" nullable>
					<template #prefix><i class="ti ti-key"></i></template>
					<template #label>{{ i18n.ts.recaptchaSecretKey }}</template>
				</MkInput>
				<FormSlot v-if="recaptchaSiteKey">
					<template #label>{{ i18n.ts.preview }}</template>
					<MkCaptcha provider="recaptcha" :sitekey="recaptchaSiteKey"/>
				</FormSlot>
			</template>
			<template v-else-if="provider === 'turnstile'">
				<MkInput type="text" v-model="turnstileSiteKey" nullable>
					<template #prefix><i class="ti ti-key"></i></template>
					<template #label>{{ i18n.ts.turnstileSiteKey }}</template>
				</MkInput>
				<MkInput type="text" v-model="turnstileSecretKey" nullable>
					<template #prefix><i class="ti ti-key"></i></template>
					<template #label>{{ i18n.ts.turnstileSecretKey }}</template>
				</MkInput>
				<FormSlot>
					<template #label>{{ i18n.ts.preview }}</template>
					<MkCaptcha provider="turnstile" :sitekey="turnstileSiteKey || '1x00000000000000000000AA'"/>
				</FormSlot>
			</template>

			<MkButton primary @click="save"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
		</div>
	</FormSuspense>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import MkRadios from '@/components/MkRadios.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import FormSuspense from '@/components/form/suspense.vue';
import FormSlot from '@/components/form/slot.vue';
import * as os from '@/os.js';
import { fetchInstance } from '@/instance.js';
import { i18n } from '@/i18n.js';

const MkCaptcha = defineAsyncComponent(() => import('@/components/MkCaptcha.vue'));

let provider = $ref<string | null>(null);
let hcaptchaSiteKey = $ref<string | null>(null);
let hcaptchaSecretKey = $ref<string | null>(null);
let recaptchaSiteKey = $ref<string | null>(null);
let recaptchaSecretKey = $ref<string | null>(null);
let turnstileSiteKey = $ref<string | null>(null);
let turnstileSecretKey = $ref<string | null>(null);

async function init() {
	const meta = await os.api('admin/meta');
	hcaptchaSiteKey = meta.hcaptchaSiteKey;
	hcaptchaSecretKey = meta.hcaptchaSecretKey;
	recaptchaSiteKey = meta.recaptchaSiteKey;
	recaptchaSecretKey = meta.recaptchaSecretKey;
	turnstileSiteKey = meta.turnstileSiteKey;
	turnstileSecretKey = meta.turnstileSecretKey;

	provider = meta.enableHcaptcha ? 'hcaptcha' : meta.enableRecaptcha ? 'recaptcha' : meta.enableTurnstile ? 'turnstile' : null;
}

function save() {
	os.apiWithDialog('admin/update-meta', {
		enableHcaptcha: provider === 'hcaptcha',
		hcaptchaSiteKey,
		hcaptchaSecretKey,
		enableRecaptcha: provider === 'recaptcha',
		recaptchaSiteKey,
		recaptchaSecretKey,
		enableTurnstile: provider === 'turnstile',
		turnstileSiteKey,
		turnstileSecretKey,
	}).then(() => {
		fetchInstance();
	});
}
</script>
