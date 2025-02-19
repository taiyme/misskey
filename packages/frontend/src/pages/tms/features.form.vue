<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<div class="_gaps_s">
		<MkInfo>{{ i18n.ts._tms.taiymeFeaturesDescription }} <MkA to="/tms/about" class="_link">{{ i18n.ts.learnMore }}</MkA></MkInfo>
	</div>
	<MkFolder defaultOpen>
		<template #icon><i class="ti ti-palette"></i></template>
		<template #label>{{ i18n.ts.appearance }}</template>
		<template v-if="appearancesForm.modified.value" #footer>
			<MkFormFooter :form="appearancesForm"/>
		</template>
		<div class="_gaps">
			<MkSelect v-model="appearancesForm.state.tickerPosition">
				<template #label>
					<span>{{ i18n.ts._tms._features._tickerPosition.label }}</span>
					<span v-if="appearancesForm.modifiedStates.tickerPosition" class="_modified">{{ i18n.ts.modified }}</span>
				</template>
				<option value="default">{{ i18n.ts._tms._features._tickerPosition.default }}</option>
				<option value="leftVerticalBar">{{ i18n.ts._tms._features._tickerPosition.leftVerticalBar }}</option>
				<option value="rightVerticalBar">{{ i18n.ts._tms._features._tickerPosition.rightVerticalBar }}</option>
				<option value="leftWatermark">{{ i18n.ts._tms._features._tickerPosition.leftWatermark }}</option>
				<option value="rightWatermark">{{ i18n.ts._tms._features._tickerPosition.rightWatermark }}</option>
			</MkSelect>
			<MkSelect v-model="appearancesForm.state.superMenuDisplayMode">
				<template #label>
					<span>{{ i18n.ts._tms._features._superMenuDisplayMode.label }}</span>
					<span v-if="appearancesForm.modifiedStates.superMenuDisplayMode" class="_modified">{{ i18n.ts.modified }}</span>
				</template>
				<template #caption>{{ i18n.ts._tms._features._superMenuDisplayMode.caption }}</template>
				<option value="default">{{ i18n.ts._tms._features._superMenuDisplayMode.default }}</option>
				<option value="classic">{{ i18n.ts._tms._features._superMenuDisplayMode.classic }}</option>
				<option value="forceList">{{ i18n.ts._tms._features._superMenuDisplayMode.forceList }}</option>
			</MkSelect>
		</div>
	</MkFolder>
	<MkFolder defaultOpen>
		<template #icon><i class="ti ti-hand-click"></i></template>
		<template #label>{{ i18n.ts.operations }}</template>
		<template v-if="operationsForm.modified.value" #footer>
			<MkFormFooter :form="operationsForm"/>
		</template>
		<div class="_gaps">
			<MkSelect v-model="operationsForm.state.pullToRefreshSensitivity">
				<template #label>
					<span>{{ i18n.ts._tms._features._pullToRefreshSensitivity.label }}</span>
					<span v-if="operationsForm.modifiedStates.pullToRefreshSensitivity" class="_modified">{{ i18n.ts.modified }}</span>
				</template>
				<template #caption>{{ i18n.ts._tms._features._pullToRefreshSensitivity.caption }}</template>
				<option value="low">{{ i18n.ts._tms._features._pullToRefreshSensitivity.low }}</option>
				<option value="middle">{{ i18n.ts._tms._features._pullToRefreshSensitivity.middle }}</option>
				<option value="high">{{ i18n.ts._tms._features._pullToRefreshSensitivity.high }}</option>
			</MkSelect>
			<MkSwitch v-model="operationsForm.state.pullToRefreshAllReload">
				<template #label>
					<span>{{ i18n.ts._tms._features._pullToRefreshAllReload.label }}</span>
					<span v-if="operationsForm.modifiedStates.pullToRefreshAllReload" class="_modified">{{ i18n.ts.modified }}</span>
				</template>
				<template #caption>{{ i18n.ts._tms._features._pullToRefreshAllReload.caption }}</template>
			</MkSwitch>
			<MkSwitch v-model="operationsForm.state.preventLongPressContextMenu">
				<template #label>
					<span>{{ i18n.ts._tms._features._preventLongPressContextMenu.label }}</span>
					<span class="_beta">{{ i18n.ts.experimentalFeatures }}</span>
					<span v-if="operationsForm.modifiedStates.preventLongPressContextMenu" class="_modified">{{ i18n.ts.modified }}</span>
				</template>
				<template #caption>{{ i18n.ts._tms._features._preventLongPressContextMenu.caption }}</template>
			</MkSwitch>
		</div>
	</MkFolder>
	<FormLink to="/tms/user-custom-css">
		<template #icon><i class="ti ti-code"></i></template>
		<template #default>{{ i18n.ts._tms._customCss.userCustomCss }}</template>
	</FormLink>
	<FormLink v-if="iAmAdmin" to="/tms/server-custom-css">
		<template #icon><i class="ti ti-code"></i></template>
		<template #default>{{ i18n.ts._tms._customCss.serverCustomCss }}</template>
	</FormLink>
</div>
</template>

<script lang="ts" setup>
import { iAmAdmin } from '@/account.js';
import { i18n } from '@/i18n.js';
import { useForm } from '@/scripts/use-form.js';
import { tmsFlaskStore } from '@/tms/flask-store.js';
import { tmsStore } from '@/tms/store.js';
import FormLink from '@/components/form/link.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkFormFooter from '@/components/MkFormFooter.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkSwitch from '@/components/MkSwitch.vue';

const appearancesForm = useForm({
	tickerPosition: tmsStore.state.tickerPosition,
	superMenuDisplayMode: tmsStore.state.superMenuDisplayMode,
}, async (state) => {
	tmsStore.set('tickerPosition', state.tickerPosition);
	tmsStore.set('superMenuDisplayMode', state.superMenuDisplayMode);
});

const operationsForm = useForm({
	pullToRefreshSensitivity: tmsStore.state.pullToRefreshSensitivity,
	pullToRefreshAllReload: tmsStore.state.pullToRefreshAllReload,
	preventLongPressContextMenu: tmsFlaskStore.state.preventLongPressContextMenu,
}, async (state) => {
	tmsStore.set('pullToRefreshSensitivity', state.pullToRefreshSensitivity);
	tmsStore.set('pullToRefreshAllReload', state.pullToRefreshAllReload);
	tmsFlaskStore.set('preventLongPressContextMenu', state.preventLongPressContextMenu);
});
</script>
