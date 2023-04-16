<template>
<MkTab v-model="tab" style="margin-bottom: var(--margin);">
	<option value="overview"><i class="ti ti-info-circle"></i> {{ i18n.ts.overview }}</option>
	<option value="settings"><i class="ti ti-settings"></i> {{ i18n.ts.settings }}</option>
</MkTab>

<div v-if="tab === 'overview'" class="_formRoot">
	<FormSection>
		<MkKeyValue class="_formBlock" :copy="version">
			<template #key>{{ i18n.ts.version }}</template>
			<template #value>{{ version }}</template>
		</MkKeyValue>
	</FormSection>

	<FormSection>
		<template #label>taiyme/misskeyについて</template>
		<div class="_formBlock">taiyme/misskeyは、taiyによって無償でメンテナンスされています。<br>継続して提供するためにも、開発のサポートや寄付をお願いします。</div>
		<div class="_formLinks">
			<FormLink to="https://github.com/taiyme/misskey" external>
				<template #icon><i class="ti ti-code"></i></template>
				taiyme/misskeyの開発に参加
				<template #suffix>GitHub</template>
			</FormLink>
			<FormLink to="https://u.taiy.me/donate" external>
				<template #icon><i class="ti ti-pig-money"></i></template>
				taiyに寄付
				<template #suffix>Donate</template>
			</FormLink>
		</div>
	</FormSection>

	<FormSection>
		<template #label>コラボレーター</template>
		<div class="_formLinks">
			<template v-for="collaborator in collaborators" :key="collaborator.name">
				<FormLink :to="`https://github.com/${collaborator.acct}`" external>
					{{ collaborator.name }}
					<template #suffix>{{ `@${collaborator.acct}` }}</template>
				</FormLink>
			</template>
		</div>
	</FormSection>

	<FormSection>
		<template #label>コントリビューター</template>
		<div class="_formLinks">
			<template v-for="contributor in contributors" :key="contributor.name">
				<FormLink :to="`https://github.com/${contributor.acct}`" external>
					{{ contributor.name }}
					<template #suffix>{{ `@${contributor.acct}` }}</template>
				</FormLink>
			</template>
		</div>
	</FormSection>

	<FormSection>
		<template #label>支援者</template>
		<div v-for="patron in patrons" :key="patron">{{ patron }}</div>
	</FormSection>
</div>

<div v-else-if="tab === 'settings'" class="_formRoot">
	<MkInfo warn class="_formBlock">設定は自動で保存されません。画面下部の保存ボタンを使用してください。</MkInfo>

	<FormSection>
		<template #label>プレビュー</template>
		<div class="_formBlock">
			<MkSampleNote
				:instance-ticker-position="computed(() => tmsInstanceTickerPosition)"
				:use-reaction-menu="computed(() => tmsUseReactionMenu)"
				:use-easy-reactions-viewer="computed(() => tmsUseEasyReactionsViewer)"
				:show-actions-only-on-hover="computed(() => tmsShowActionsOnlyOnHover)"
			/>
		</div>
	</FormSection>

	<FormSection>
		<FormSelect v-model="tmsInstanceTickerPosition" class="_formBlock">
			<template #label>ノートのインスタンス情報の表示位置</template>
			<option value="normal">通常</option>
			<option value="leftedge">←左端</option>
			<option value="rightedge">右端→</option>
			<option value="bottomleft">↙左下</option>
			<option value="bottomright">右下↘</option>
			<template #caption>タイムライン上のノートのインスタンス情報を指定した位置に表示します。</template>
		</FormSelect>

		<FormSwitch v-model="tmsUseReactionMenu" class="_formBlock">
			リアクションメニューを有効にする
			<template #caption>リアクションを押したとき、リアクションメニューを表示するようにします。無効にすると従来のトグル式になります。</template>
		</FormSwitch>

		<FormSwitch v-model="tmsUseEasyReactionsViewer" class="_formBlock">
			ノートのリアクションを見やすくする
			<template #caption>ノートのリアクションを見やすくします。リアクションの背景色は白固定になります。</template>
		</FormSwitch>

		<FormSwitch v-model="tmsShowActionsOnlyOnHover" class="_formBlock">
			ノートの操作部をホバー時のみ表示する
			<template v-if="!isTouchUsing && deviceKind !== 'smartphone'" #caption>タイムライン上のノートにカーソルを合わせたときのみ、操作部を表示するようにします。</template>
			<template v-else #caption>スマートフォンなどのタッチデバイスでは、このオプションは無効になります。</template>
		</FormSwitch>
	</FormSection>

	<FormSection>
		<FormSwitch v-model="tmsCollapseNote" class="_formBlock">
			ノートを畳む
			<template #caption>タイムライン上のノートが特定の条件の場合、畳んで表示します。無効にすると常に展開して表示します。</template>
		</FormSwitch>
		<FormFolder>
			<template #label>ノートを畳む条件</template>
			<template #suffix>{{ tmsCollapseNote ? i18n.ts.enabled : i18n.ts.disabled }}</template>

			<div class="_formRoot">
				<MkInfo class="_formBlock">0以上の整数を指定してください。0を指定すると条件が無効になります。</MkInfo>
				<FormInput v-model="tmsCollapseNoteHeight" type="number" class="_formBlock">
					<template #label>ノート本文の高さ</template>
					<template #suffix>px</template>
					<template #caption>タイムライン上のノートがこの高さを超えた場合、畳んで表示します。ピクセル単位で指定してください。</template>
				</FormInput>
				<FormInput v-model="tmsCollapseNoteFile" type="number" class="_formBlock">
					<template #label>添付ファイルの個数</template>
					<template #suffix>個</template>
					<template #caption>タイムライン上のノートの添付ファイルがこの個数を超えた場合、畳んで表示します。</template>
				</FormInput>
				<FormInput v-model="tmsCollapseNoteUrl" type="number" class="_formBlock">
					<template #label>URLの個数</template>
					<template #suffix>個</template>
					<template #caption>タイムライン上のノートのURLがこの個数を超えた場合、畳んで表示します。</template>
				</FormInput>
				<FormInput v-model="tmsCollapseNotePoll" type="number" class="_formBlock">
					<template #label>アンケートの選択肢の個数</template>
					<template #suffix>個</template>
					<template #caption>タイムライン上のノートのアンケートの選択肢がこの個数を超えた場合、畳んで表示します。</template>
				</FormInput>
			</div>
		</FormFolder>

		<FormSwitch v-model="tmsCollapseRenote" class="_formBlock">
			一度見たノートのRenoteを畳む
			<template #caption>タイムライン上の一度見たノートのRenoteを畳んで表示します。本文をクリックすると展開します。</template>
		</FormSwitch>
	</FormSection>

	<FormSection>
		<FormSwitch v-model="tmsUsePakuru" class="_formBlock">
			「パクる」機能を有効にする
			<template #caption>Renoteメニューに「パクる」を追加します。</template>
		</FormSwitch>

		<FormSwitch v-model="tmsUseNumberquote" class="_formBlock">
			「数字引用」機能を有効にする
			<template #caption>Renoteメニューに「数字引用する」を追加します。</template>
		</FormSwitch>
	</FormSection>

	<FormSection>
		<FormSwitch v-model="tmsUseImanonashi" class="_formBlock">
			「いまのなし」機能を有効にする
			<template #caption>消せ消せ消せ消せ消せ</template>
		</FormSwitch>
		<FormFolder>
			<template #label>削除する条件</template>
			<template #suffix>{{ tmsUseImanonashi ? i18n.ts.enabled : i18n.ts.disabled }}</template>

			<div class="_formRoot">
				<FormTextarea v-model="tmsImanonashiWords" class="_formBlock">
					<template #label>単語</template>
					<template #caption>スペースで区切るとAND指定になり、改行で区切るとOR指定になります。<br>キーワードをスラッシュで囲むと正規表現になります。</template>
				</FormTextarea>
				<FormSwitch v-model="tmsImanonashiConfirm" class="_formBlock">
					削除を確認する
					<template #caption>ノートを削除するときに確認します。</template>
				</FormSwitch>
				<FormSwitch v-model="tmsImanonashiItself" class="_formBlock">
					いまのなしも削除する
					<template #caption>ノートを削除するときに、同時にいまのなしも削除します。</template>
				</FormSwitch>
			</div>
		</FormFolder>
	</FormSection>

	<FormSection>
		<MkButton class="_formBlock" primary :disabled="!changed" @click="save"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
		<template #caption>設定の同期は有効です。</template>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { watch, computed } from 'vue';
import FormLink from '@/components/form/link.vue';
import FormSelect from '@/components/form/select.vue';
import FormSwitch from '@/components/form/switch.vue';
import FormInput from '@/components/form/input.vue';
import FormTextarea from '@/components/form/textarea.vue';
import FormSection from '@/components/form/section.vue';
import FormFolder from '@/components/form/folder.vue';
import MkButton from '@/components/MkButton.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkTab from '@/components/MkTab.vue';
import MkSampleNote from '@/components/MkNote.sample.vue';
import * as os from '@/os';
import { isTouchUsing } from '@/scripts/touch';
import { deviceKind } from '@/scripts/device-kind';
import { unisonReload } from '@/scripts/unison-reload';
import { i18n } from '@/i18n';
import { version } from '@/config';
import { tmsStore } from '@/tms/store';
import { renderWords, parseWords, checkWords } from '@/scripts/tms/words';

// #region person
type Contributor = {
	name: string;
	acct: string;
};

const collaborators: Contributor[] = [
	{
		name: 'taiy',
		acct: 'taiyme',
	},
	{
		name: 'かふぇいんぱわぁ',
		acct: 'cffnpwr',
	},
];

const contributors: Contributor[] = [
	{
		name: 'すてさん',
		acct: 'Steve-0628',
	},
	{
		name: 'hyuoou',
		acct: 'hyuoou',
	},
	{
		name: 'わかさぎシステム',
		acct: 'DA-TENSHI',
	},
	{
		name: 'CyberRex',
		acct: 'CyberRex0',
	},
];

const patrons: string[] = [
	'すえ',
	'Midra',
	'ゆー',
	'こちゅだぁほ',
	'xyzzy',
	'ふれすと',
];
// #endregion

// flag
let tab = $ref('overview');
let changed = $ref(false);

// #region v-model
const tmsInstanceTickerPosition = $ref(tmsStore.state.instanceTickerPosition);
const tmsUseReactionMenu = $ref(tmsStore.state.useReactionMenu);
const tmsUseEasyReactionsViewer = $ref(tmsStore.state.useEasyReactionsViewer);
const tmsShowActionsOnlyOnHover = $ref(tmsStore.state.showActionsOnlyOnHover);
const tmsCollapseNote = $ref(tmsStore.state.collapseNote);
const tmsCollapseNoteHeight = $ref(tmsStore.state.collapseNoteHeight);
const tmsCollapseNoteFile = $ref(tmsStore.state.collapseNoteFile);
const tmsCollapseNoteUrl = $ref(tmsStore.state.collapseNoteUrl);
const tmsCollapseNotePoll = $ref(tmsStore.state.collapseNotePoll);
const tmsCollapseRenote = $ref(tmsStore.state.collapseRenote);
const tmsUsePakuru = $ref(tmsStore.state.usePakuru);
const tmsUseNumberquote = $ref(tmsStore.state.useNumberquote);
const tmsUseImanonashi = $ref(tmsStore.state.useImanonashi);
const tmsImanonashiWords = $ref(renderWords(tmsStore.state.imanonashiWords));
const tmsImanonashiConfirm = $ref(tmsStore.state.imanonashiConfirm);
const tmsImanonashiItself = $ref(tmsStore.state.imanonashiItself);
// #endregion

// #region change
watch(
	[
		$$(tmsInstanceTickerPosition),
		$$(tmsUseReactionMenu),
		$$(tmsUseEasyReactionsViewer),
		$$(tmsShowActionsOnlyOnHover),
		$$(tmsCollapseNote),
		$$(tmsCollapseNoteHeight),
		$$(tmsCollapseNoteFile),
		$$(tmsCollapseNoteUrl),
		$$(tmsCollapseNotePoll),
		$$(tmsCollapseRenote),
		$$(tmsUsePakuru),
		$$(tmsUseNumberquote),
		$$(tmsUseImanonashi),
		$$(tmsImanonashiWords),
		$$(tmsImanonashiConfirm),
		$$(tmsImanonashiItself),
	],
	() => {
		changed = true;
	},
);
// #endregion

// #region check/save
const check = async (): Promise<{
	ok: boolean;
	errors: string[];
}> => {
	const errors: string[] = [];
	const isNumberInRange = (x: number, min?: number, max?: number): boolean => {
		if (!Number.isInteger(x)) return false;
		if (Math.sign(x) === -1) return false;
		return (min == null ? -Infinity : min) <= x && x <= (max == null ? Infinity : max);
	};
	if (!isNumberInRange(tmsCollapseNoteHeight, 0)) errors.push(`[RangeError]: key=collapseNoteHeight; input=${tmsCollapseNoteHeight};`);
	if (!isNumberInRange(tmsCollapseNoteFile, 0)) errors.push(`[RangeError]: key=collapseNoteFile; input=${tmsCollapseNoteFile};`);
	if (!isNumberInRange(tmsCollapseNoteUrl, 0)) errors.push(`[RangeError]: key=collapseNoteUrl; input=${tmsCollapseNoteUrl};`);
	if (!isNumberInRange(tmsCollapseNotePoll, 0)) errors.push(`[RangeError]: key=collapseNotePoll; input=${tmsCollapseNotePoll};`);
	if (!checkWords(tmsImanonashiWords)) errors.push(`[SyntaxError]: key=imanonashiWords; input=${tmsImanonashiWords};`);
	return {
		ok: errors.length === 0,
		errors,
	};
};

const save = async (): Promise<void> => {
	if (!changed) return;
	const { ok, errors } = await check();

	if (!ok) {
		return os.alert({
			type: 'error',
			text: errors.join('\n'),
		});
	}

	type Store = typeof tmsStore.state;
	type StoreKeys = keyof Store;

	const regist = (key: StoreKeys, newValue: Store[StoreKeys]): void => {
		const isPrimitive = (x: unknown): x is string | number | boolean | bigint => {
			switch (typeof x) {
				case 'string':
				case 'number':
				case 'boolean':
				case 'bigint': {
					return true;
				}
				default: {
					return false;
				}
			}
		};

		// プリミティブ型の場合、値が同じならsetしない
		const oldValue = tmsStore.state[key];
		if (isPrimitive(oldValue) && isPrimitive(newValue)) {
			if (oldValue === newValue) return;
		}

		// TODO: 配列の比較もしたい

		tmsStore.set(key, newValue);
	};

	regist('instanceTickerPosition', tmsInstanceTickerPosition);
	regist('useReactionMenu', tmsUseReactionMenu);
	regist('useEasyReactionsViewer', tmsUseEasyReactionsViewer);
	regist('showActionsOnlyOnHover', tmsShowActionsOnlyOnHover);
	regist('collapseNote', tmsCollapseNote);
	regist('collapseNoteHeight', tmsCollapseNoteHeight);
	regist('collapseNoteFile', tmsCollapseNoteFile);
	regist('collapseNoteUrl', tmsCollapseNoteUrl);
	regist('collapseNotePoll', tmsCollapseNotePoll);
	regist('collapseRenote', tmsCollapseRenote);
	regist('usePakuru', tmsUsePakuru);
	regist('useNumberquote', tmsUseNumberquote);
	regist('useImanonashi', tmsUseImanonashi);
	regist('imanonashiWords', parseWords(tmsImanonashiWords));
	regist('imanonashiConfirm', tmsImanonashiConfirm);
	regist('imanonashiItself', tmsImanonashiItself);

	changed = false;

	const { canceled } = await os.confirm({
		type: 'info',
		text: i18n.ts.reloadToApplySetting,
	});

	if (canceled) return;

	unisonReload();
};
// #endregion
</script>
