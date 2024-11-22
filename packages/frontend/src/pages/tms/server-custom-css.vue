<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader/></template>
	<template #default>
		<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
			<template v-if="previewing">
				<div class="_gaps_m">
					<div class="_gaps_s">
						<MkInfo>{{ i18n.ts._tms._customCss.displayCorrectlyDuringPreview }}</MkInfo>
					</div>
					<div inert>
						<MkCodeEditor v-model="customCssRef" readonly lang="css">
							<template #label>{{ i18n.ts._tms._customCss.serverCustomCss }}</template>
						</MkCodeEditor>
					</div>
					<div style="margin-left: auto;" class="_buttons">
						<MkButton danger rounded @click="confirmDiscard">
							<i class="ti ti-x"></i> {{ i18n.ts.discard }}
						</MkButton>
						<MkButton primary rounded @click="confirmSave">
							<i class="ti ti-check"></i> {{ i18n.ts.save }}
						</MkButton>
					</div>
				</div>
			</template>
			<template v-else-if="customCssPreviewId != null">
				<div class="_gaps_m">
					<div class="_gaps_s">
						<MkInfo warn>{{ i18n.ts.cannotPerformTemporary }}</MkInfo>
					</div>
				</div>
			</template>
			<template v-else>
				<div class="_gaps_m">
					<div class="_gaps_s">
						<MkInfo warn>{{ i18n.ts._tms._customCss.serverCustomCssWarn }}</MkInfo>
						<MkInfo>{{ i18n.ts._tms._customCss.serverCustomCssInfo }}</MkInfo>
					</div>
					<div class="_gaps_s">
						<MkCodeEditor v-model="customCssRef" lang="css">
							<template #label>{{ i18n.ts._tms._customCss.serverCustomCss }}</template>
						</MkCodeEditor>
						<div style="margin-left: auto;">
							<MkButton primary rounded :disabled="!hasChange" @click="confirmPreview">
								<i class="ti ti-check"></i> {{ i18n.ts.save }}
							</MkButton>
						</div>
					</div>
				</div>
			</template>
		</MkSpacer>
	</template>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, toValue } from 'vue';
import { i18n } from '@/i18n.js';
import { fetchInstance, instance } from '@/instance.js';
import { apiWithDialog, confirm } from '@/os.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { applyServerCustomCss, CUSTOM_CSS_PREVIEW_PARAM_KEY, customCssPreviewData, customCssPreviewId } from '@/tms/custom-css.js';
import MkButton from '@/components/MkButton.vue';
import MkCodeEditor from '@/components/MkCodeEditor.vue';
import MkInfo from '@/components/MkInfo.vue';

const previewData = customCssPreviewId?.startsWith('server.') ? customCssPreviewData : null;
const previewing = previewData != null;

const customCssRef = ref(previewData ?? instance.taiymeServerCustomCss ?? '');
const beforeCustomCssRef = ref(customCssRef.value);

const hasChange = computed(() => beforeCustomCssRef.value !== customCssRef.value);

async function immediatelySave() {
	const cssText = toValue(customCssRef);

	await apiWithDialog('admin/update-meta', { taiymeServerCustomCss: customCssRef.value });
	await fetchInstance(true);
	beforeCustomCssRef.value = cssText;
	applyServerCustomCss(cssText);
}

async function confirmSave() {
	const { canceled } = await confirm({
		type: 'info',
		text: i18n.ts._tms._customCss.reloadRequiredToApplyCustomCss,
	});
	if (canceled) return;

	const cssText = toValue(customCssRef);

	if (customCssPreviewId != null) {
		window.sessionStorage.removeItem(customCssPreviewId);
	}
	await apiWithDialog('admin/update-meta', { taiymeServerCustomCss: customCssRef.value });
	await fetchInstance(true);
	beforeCustomCssRef.value = cssText;

	const url = new URL(window.location.href);
	url.searchParams.delete(CUSTOM_CSS_PREVIEW_PARAM_KEY);

	window.location.href = url.href;
}

async function confirmDiscard() {
	const { canceled } = await confirm({
		type: 'info',
		text: i18n.ts._tms._customCss.discardAndRevertConfirm,
	});
	if (canceled) return;

	if (customCssPreviewId != null) {
		window.sessionStorage.removeItem(customCssPreviewId);
	}

	const url = new URL(window.location.href);
	url.searchParams.delete(CUSTOM_CSS_PREVIEW_PARAM_KEY);

	window.location.href = url.href;
}

async function confirmPreview() {
	if (customCssRef.value.trim() === '') {
		return immediatelySave();
	}

	const { canceled } = await confirm({
		type: 'info',
		text: i18n.ts._tms._customCss.previewRequiredToApplyCustomCss,
	});
	if (canceled) return;

	const cssText = toValue(customCssRef);

	const newPreviewId = `server.${window.crypto.randomUUID()}`;
	window.sessionStorage.setItem(newPreviewId, cssText);
	beforeCustomCssRef.value = cssText;

	const url = new URL(window.location.href);
	url.searchParams.set(CUSTOM_CSS_PREVIEW_PARAM_KEY, newPreviewId);
	url.pathname = '/';

	window.location.href = url.href;
}

definePageMetadata(() => ({
	title: i18n.ts._tms._customCss.serverCustomCss,
	icon: 'ti ti-code',
}));
</script>
