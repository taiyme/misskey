<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, '_panel']">
	<!-- 通報されたユーザー -->
	<div :class="[$style.item, '_gaps_s']">
		<MkA v-user-preview="props.report.targetUser.id" :to="`/admin/user/${props.report.targetUser.id}`" :behavior="'window'">
			<MkUserCardMini :user="props.report.targetUser"/>
		</MkA>
		<div :class="$style.userStatus">
			<button
				v-if="props.report.targetUser.isSuspended"
				v-tooltip:dialog="i18n.ts.userSuspended"
				:class="['_button', $style.badge, $style.isSuspended]"
				v-text="'Suspended'"
			/>
			<button
				v-if="props.report.targetUser.isSilenced"
				v-tooltip:dialog="i18n.ts.userSilenced"
				:class="['_button', $style.badge, $style.isSilenced]"
				v-text="'Silenced'"
			/>
			<button
				v-if="props.report.targetUser.moderationNote != null && props.report.targetUser.moderationNote.trim() !== ''"
				v-tooltip:dialog="props.report.targetUser.moderationNote.trim()"
				:class="['_button', $style.badge]"
				v-text="i18n.ts.moderationNote"
			/>
		</div>
	</div>

	<!-- 通報の本文 -->
	<div :class="$style.item">
		<MkOmit v-if="props.report.comment.trim() !== ''" toggleable>
			<Mfm :text="props.report.comment.trim()" :linkNavigationBehavior="'window'"/>
		</MkOmit>
		<span v-else :class="$style.noComment">({{ i18n.ts.noDescription }})</span>
	</div>

	<!-- 通報の情報 -->
	<div :class="[$style.item, '_gaps_s']">
		<div :class="$style.information">
			<div :class="$style.infoItem">
				<div :class="$style.infoLabel">{{ i18n.ts.reporter }}</div>
				<div :class="$style.infoContent">
					<MkA :to="`/admin/user/${props.report.reporter.id}`" class="_link" :behavior="'window'">
						<MkAcct :user="props.report.reporter"/>
					</MkA>
				</div>
			</div>
			<div :class="$style.infoItem">
				<div :class="$style.infoLabel">{{ i18n.ts.createdAt }}</div>
				<div :class="$style.infoContent">{{ dateString(props.report.createdAt) }} (<MkTime :time="props.report.createdAt"/>)</div>
			</div>
		</div>
		<div v-if="hideReportMemoRef">
			<button class="_textButton" @click="showReportMemo">
				{{ i18n.ts._tms._abuseUserReport.addReportMemo }}
			</button>
		</div>
		<div v-else>
			<TmsUserMemoInput ref="reportMemoEl" v-model="editReportMemoRef" @update:modelValue="updateReportMemo">
				<template #heading>{{ i18n.ts._tms._abuseUserReport.reportMemo }}</template>
				<template #caption>{{ i18n.ts._tms._abuseUserReport.reportMemoIsSharedAmongModerators }}</template>
			</TmsUserMemoInput>
		</div>
	</div>

	<!-- 通報の状態 -->
	<div :class="$style.item">
		<div v-if="resolvedRef">
			<i class="ti ti-check" style="color: var(--MI_THEME-success); margin-right: 0.5em;"></i>
			<I18n v-if="props.report.assignee != null" :src="i18n.ts._tms._abuseUserReport.resolvedBy" tag="span">
				<template #user>
					<MkA :to="`/admin/user/${props.report.assignee.id}`" class="_link" :behavior="'window'">
						<MkAcct :user="props.report.assignee"/>
					</MkA>
				</template>
			</I18n>
			<span v-else>{{ i18n.ts._tms._abuseUserReport.resolved }}</span>
		</div>
		<div v-if="resolvedAsRef === 'accept'">
			<i class="ti ti-check" style="color: var(--MI_THEME-success); margin-right: 0.5em;"></i>
			<span>{{ i18n.ts._tms._abuseUserReport.markedAsAccept }}</span>
		</div>
		<div v-else-if="resolvedAsRef === 'reject'">
			<i class="ti ti-x" style="color: var(--MI_THEME-error); margin-right: 0.5em;"></i>
			<span>{{ i18n.ts._tms._abuseUserReport.markedAsReject }}</span>
		</div>
		<div v-if="forwardedRef">
			<i class="ti ti-check" style="color: var(--MI_THEME-success); margin-right: 0.5em;"></i>
			<span>{{ i18n.ts._tms._abuseUserReport.forwardedReport }}</span>
		</div>
	</div>

	<!-- 通報の操作 -->
	<div :class="$style.item">
		<div v-if="!resolvedRef" class="_gaps_s">
			<MkRadios v-model="editResolvedAsRef">
				<option value="accept">
					<i class="ti ti-check" style="color: var(--MI_THEME-success); margin-right: 0.25em;"></i>
					<span>{{ i18n.ts._abuseUserReport.accept }}</span>
				</option>
				<option value="reject">
					<i class="ti ti-x" style="color: var(--MI_THEME-error); margin-right: 0.25em;"></i>
					<span>{{ i18n.ts._abuseUserReport.reject }}</span>
				</option>
				<option :value="null">
					<span>{{ i18n.ts.other }}</span>
				</option>
			</MkRadios>
			<div :class="$style.operations">
				<MkSwitch v-if="props.report.targetUser.host != null" v-model="editForwardRef" :helpText="i18n.ts._abuseUserReport.forwardDescription">
					<template #label>{{ i18n.ts._tms._abuseUserReport.forwardReport }}</template>
				</MkSwitch>
				<div :class="$style.resolveButton">
					<MkButton v-if="editResolvedAsRef === 'accept'" primary @click="resolveReport">
						<i class="ti ti-check" style="margin-right: 0.5em;"></i>
						<span>{{ i18n.ts._tms._abuseUserReport.markAsAcceptedAndResolve }}</span>
					</MkButton>
					<MkButton v-else-if="editResolvedAsRef === 'reject'" danger @click="resolveReport">
						<i class="ti ti-x" style="margin-right: 0.5em;"></i>
						<span>{{ i18n.ts._tms._abuseUserReport.markAsRejectedAndResolve }}</span>
					</MkButton>
					<MkButton v-else @click="resolveReport">
						<i class="ti ti-check" style="margin-right: 0.5em;"></i>
						<span>{{ i18n.ts._tms._abuseUserReport.markAsOtherAndResolve }}</span>
					</MkButton>
				</div>
			</div>
		</div>
		<div v-else-if="!forwardedRef && props.report.targetUser.host != null">
			<div :class="$style.operations">
				<div :class="$style.resolveButton">
					<MkButton @click="forwardReport">
						{{ i18n.ts._tms._abuseUserReport.forwardReport }}
					</MkButton>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { nextTick, ref, useTemplateRef } from 'vue';
import type * as Misskey from 'misskey-js';
import { apiWithDialog } from '@/os.js';
import { i18n } from '@/i18n.js';
import { dateString } from '@/filters/date.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import MkButton from '@/components/MkButton.vue';
import MkOmit from '@/components/MkOmit.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkUserCardMini from '@/components/MkUserCardMini.vue';
import TmsUserMemoInput from '@/components/TmsUserMemo.input.vue';

export type AbuseUserReport = Misskey.entities.AdminAbuseUserReportsResponse[number];

const props = defineProps<{
	report: AbuseUserReport;
}>();

const emit = defineEmits<{
	resolved: [reportId: string];
}>();

const reportMemoEl = useTemplateRef('reportMemoEl');

const editResolvedAsRef = ref<AbuseUserReport['resolvedAs']>('accept');
const editForwardRef = ref(false);

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const editReportMemoRef = ref(props.report.moderationNote.trim());
// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const hideReportMemoRef = ref(props.report.moderationNote.trim() === '');

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const resolvedRef = ref(props.report.resolved);
// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const resolvedAsRef = ref(props.report.resolvedAs);
// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const forwardedRef = ref(props.report.forwarded);

const resolveReport = () => {
	// 解決済みは弾く
	if (resolvedRef.value) return;

	const reportId = props.report.id;
	const resolvedAs = editResolvedAsRef.value;
	const forward = editForwardRef.value && props.report.targetUser.host != null;

	apiWithDialog('admin/resolve-abuse-user-report', {
		reportId,
		resolvedAs,
	}).then(() => {
		emit('resolved', reportId);
		resolvedRef.value = true;
		resolvedAsRef.value = resolvedAs;
		forwardedRef.value = forward;
	});

	if (forward) {
		misskeyApi('admin/forward-abuse-user-report', {
			reportId,
		}).catch(() => {});
	}
};

const forwardReport = () => {
	// 未解決は弾く
	if (!resolvedRef.value) return;
	// ローカルユーザーは弾く
	if (props.report.targetUser.host == null) return;

	const reportId = props.report.id;

	apiWithDialog('admin/forward-abuse-user-report', {
		reportId,
	}).then(() => {
		forwardedRef.value = true;
	});
};

const updateReportMemo = () => {
	apiWithDialog('admin/update-abuse-user-report', {
		reportId: props.report.id,
		moderationNote: editReportMemoRef.value || '',
	});
};

const showReportMemo = () => {
	if (!hideReportMemoRef.value) return;
	hideReportMemoRef.value = false;
	nextTick(() => {
		reportMemoEl.value?.focus();
	});
};
</script>

<style lang="scss" module>
.root {
	display: flex;
	flex-direction: column;
}

.item {
	padding: 16px;
	border-top: solid 0.5px var(--MI_THEME-divider);

	&:first-child {
		border-top: none;
	}

	&:empty {
		display: none;
	}
}

.userStatus {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;

	&:empty {
		display: none;
	}

	> .badge {
		display: inline-block;
		border: 1px solid var(--c, var(--MI_THEME-fg));
		border-radius: 6px;
		padding: 2px 6px;
		font-size: 85%;
		color: var(--c, var(--MI_THEME-fg));
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;

		&.isSuspended {
			--c: var(--MI_THEME-error);
		}

		&.isSilenced {
			--c: var(--MI_THEME-warn);
		}
	}
}

.noComment {
	color: var(--MI_THEME-fgTransparentWeak);
}

.information {
	display: grid;
	grid-template-columns: max-content 1fr;
	gap: 0;
}

.infoItem {
	display: grid;
	grid-template: auto / subgrid;
	grid-row: auto;
	grid-column: span 2;
	gap: 8px;
}

@container (max-width: 300px) {
	.information {
		grid-template-columns: 1fr;
		gap: 8px;
	}

	.infoItem {
		grid-template: subgrid / auto;
		grid-row: span 2;
		grid-column: auto;
		gap: 0;
	}
}

.infoLabel {
	color: var(--MI_THEME-fgTransparentWeak);
}

.infoContent {
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}

.operations {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	align-items: center;
}

.resolveButton {
	margin-left: auto;
}
</style>
