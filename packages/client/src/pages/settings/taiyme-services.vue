<template>
<MkTab v-model="tab" style="margin-bottom: var(--margin)">
	<option value="overview">
		<i class="ti ti-info-circle"></i> {{ i18n.ts.overview }}
	</option>
	<option value="settings">
		<i class="ti ti-settings"></i> {{ i18n.ts.settings }}
	</option>
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
		<div class="_formBlock">
			taiyme/misskeyは、taiyによって無償でメンテナンスされています。<br/>継続して提供するためにも、開発のサポートや寄付をお願いします。
		</div>
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
			<template v-for="collaborator in collaborators" :key="collaborator">
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
			<template v-for="contributor in contributors" :key="contributor">
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
	<MkInfo warn class="_formBlock">
		設定は自動で保存されません。画面下部の保存ボタンを使用してください。
	</MkInfo>

	<FormSection>
		<FormSwitch v-model="tmsVerticalInstanceTicker" class="_formBlock">
			ノートのインスタンス情報を左端に表示
			<template #caption>タイムライン上のインスタンス情報を左端に表示します。</template>
		</FormSwitch>

		<FormSwitch v-model="tmsIsLongEnabled" class="_formBlock">
			ノートを畳む
			<template #caption>
				タイムライン上のノートが特定の条件の場合、畳んで表示します。無効にすると常に展開して表示します。
			</template>
		</FormSwitch>
		<FormFolder>
			<template #label>ノートを畳む条件</template>
			<template v-if="tmsIsLongEnabled" #suffix>有効</template>
			<template v-else #suffix>無効</template>

			<div class="_formRoot">
				<MkInfo class="_formBlock">
					0以上の整数を指定してください。0を指定すると条件が無効になります。
				</MkInfo>
				<FormInput v-model="tmsIsLongTextElHeight" type="number" class="_formBlock">
					<template #label>ノート本文の高さ</template>
					<template #suffix>px</template>
					<template #caption>
						タイムライン上のノートがこの高さを超えた場合、畳んで表示します。ピクセル単位で指定してください。
					</template>
				</FormInput>
				<FormInput v-model="tmsIsLongFilesLength" type="number" class="_formBlock">
					<template #label>添付ファイルの個数</template>
					<template #suffix>個</template>
					<template #caption>
						タイムライン上のノートの添付ファイルがこの個数を超えた場合、畳んで表示します。
					</template>
				</FormInput>
				<FormInput v-model="tmsIsLongUrlsLength" type="number" class="_formBlock">
					<template #label>URLの個数</template>
					<template #suffix>個</template>
					<template #caption>
						タイムライン上のノートのURLがこの個数を超えた場合、畳んで表示します。
					</template>
				</FormInput>
				<FormInput v-model="tmsIsLongPollLength" type="number" class="_formBlock">
					<template #label>アンケートの選択肢の個数</template>
					<template #suffix>個</template>
					<template #caption>
						タイムライン上のノートのアンケートの選択肢がこの個数を超えた場合、畳んで表示します。
					</template>
				</FormInput>
			</div>
		</FormFolder>

		<FormSwitch v-model="tmsRenoteCollapsedEnabled" class="_formBlock">
			一度見たノートのRenoteを畳む
			<template #caption>
				タイムライン上の一度見たノートのRenoteを畳んで表示します。本文をクリックすると展開します。
			</template>
		</FormSwitch>
	</FormSection>

	<FormSection>
		<FormSwitch v-model="tmsPakuruEnabled" class="_formBlock">
			「パクる」機能を有効にする
			<template #caption>Renoteメニューに「パクる」を追加します。</template>
		</FormSwitch>

		<FormSwitch v-model="tmsNumberquoteEnabled" class="_formBlock">
			「数字引用」機能を有効にする
			<template #caption>Renoteメニューに「数字引用する」を追加します。</template>
		</FormSwitch>
	</FormSection>

	<FormSection>
		<FormSwitch v-model="tmsImanonashiEnabled" class="_formBlock">
			「いまのなし」機能を有効にする
			<template #caption>消せ消せ消せ消せ消せ</template>
		</FormSwitch>
		<FormFolder>
			<template #label>削除する条件</template>
			<template v-if="tmsImanonashiEnabled" #suffix>有効</template>
			<template v-else #suffix>無効</template>

			<div class="_formRoot">
				<FormTextarea v-model="tmsImanonashiWords" class="_formBlock">
					<template #label>単語</template>
					<template #caption>
						スペースで区切るとAND指定になり、改行で区切るとOR指定になります。<br/>キーワードをスラッシュで囲むと正規表現になります。
					</template>
				</FormTextarea>
				<FormSwitch v-model="tmsImanonashiConfirmEnabled" class="_formBlock">
					削除を確認する
					<template #caption>ノートを削除するときに確認します。</template>
				</FormSwitch>
				<FormSwitch v-model="tmsImanonashiDeleteEnabled" class="_formBlock">
					いまのなしも削除する
					<template #caption>
						ノートを削除するときに、同時にいまのなしも削除します。
					</template>
				</FormSwitch>
			</div>
		</FormFolder>
	</FormSection>

	<MkButton class="_formBlock" primary :disabled="!changed" @click="save">
		<i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}
	</MkButton>
</div>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import FormLink from '@/components/form/link.vue';
import FormSwitch from '@/components/form/switch.vue';
import FormInput from '@/components/form/input.vue';
import FormTextarea from '@/components/form/textarea.vue';
import FormSection from '@/components/form/section.vue';
import FormFolder from '@/components/form/folder.vue';
import MkButton from '@/components/MkButton.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkTab from '@/components/MkTab.vue';
import * as os from '@/os';
import { unisonReload } from '@/scripts/unison-reload';
import { i18n } from '@/i18n';
import { version } from '@/config';
import { tmsStore } from '@/tms/store';
import { renderWords, parseWords, checkWords } from '@/scripts/tms/words';

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
];

const patrons: string[] = ['すえ', 'Midra', 'ゆー', 'こちゅだぁほ'];

let tab = $ref('overview');
let changed = $ref(false);

const tmsVerticalInstanceTicker = $ref(tmsStore.state.tmsVerticalInstanceTicker);
const tmsIsLongEnabled = $ref(tmsStore.state.tmsIsLong.enabled);
const tmsIsLongTextElHeight = $ref(tmsStore.state.tmsIsLong.textElHeight);
const tmsIsLongFilesLength = $ref(tmsStore.state.tmsIsLong.filesLength);
const tmsIsLongUrlsLength = $ref(tmsStore.state.tmsIsLong.urlsLength);
const tmsIsLongPollLength = $ref(tmsStore.state.tmsIsLong.pollLength);
const tmsRenoteCollapsedEnabled = $ref(tmsStore.state.tmsRenoteCollapsedEnabled);
const tmsPakuruEnabled = $ref(tmsStore.state.tmsPakuruEnabled);
const tmsNumberquoteEnabled = $ref(tmsStore.state.tmsNumberquoteEnabled);
const tmsImanonashiEnabled = $ref(tmsStore.state.tmsImanonashi.enabled);
const tmsImanonashiWords = $ref(renderWords(tmsStore.state.tmsImanonashi.words));
const tmsImanonashiConfirmEnabled = $ref(tmsStore.state.tmsImanonashi.confirm);
const tmsImanonashiDeleteEnabled = $ref(tmsStore.state.tmsImanonashi.delete);

watch(
	[
		$$(tmsVerticalInstanceTicker),
		$$(tmsIsLongEnabled),
		$$(tmsIsLongTextElHeight),
		$$(tmsIsLongFilesLength),
		$$(tmsIsLongUrlsLength),
		$$(tmsIsLongPollLength),
		$$(tmsRenoteCollapsedEnabled),
		$$(tmsPakuruEnabled),
		$$(tmsNumberquoteEnabled),
		$$(tmsImanonashiEnabled),
		$$(tmsImanonashiWords),
		$$(tmsImanonashiConfirmEnabled),
		$$(tmsImanonashiDeleteEnabled),
	],
	() => {
		changed = true;
	},
);

async function check(): Promise<boolean> {
	const isNumberInRange = (x: number, min?: number, max?: number): boolean => {
		if (!Number.isInteger(x)) return false;
		if (Math.sign(x) === -1) return false;
		return (min == null ? -Infinity : min) <= x && x <= (max == null ? Infinity : max);
	};
	return (
		isNumberInRange(tmsIsLongTextElHeight, 0) &&
    isNumberInRange(tmsIsLongFilesLength, 0) &&
    isNumberInRange(tmsIsLongUrlsLength, 0) &&
    isNumberInRange(tmsIsLongPollLength, 0) &&
    checkWords(tmsImanonashiWords)
	);
}

async function save(): Promise<void> {
	if (await check()) {
		tmsStore.set('tmsVerticalInstanceTicker', tmsVerticalInstanceTicker);
		tmsStore.set('tmsIsLong', {
			enabled: tmsIsLongEnabled,
			textElHeight: tmsIsLongTextElHeight,
			filesLength: tmsIsLongFilesLength,
			urlsLength: tmsIsLongUrlsLength,
			pollLength: tmsIsLongPollLength,
		});
		tmsStore.set('tmsRenoteCollapsedEnabled', tmsRenoteCollapsedEnabled);
		tmsStore.set('tmsPakuruEnabled', tmsPakuruEnabled);
		tmsStore.set('tmsNumberquoteEnabled', tmsNumberquoteEnabled);
		tmsStore.set('tmsImanonashi', {
			enabled: tmsImanonashiEnabled,
			words: parseWords(tmsImanonashiWords),
			confirm: tmsImanonashiConfirmEnabled,
			delete: tmsImanonashiDeleteEnabled,
		});

		const { canceled } = await os.confirm({
			type: 'info',
			text: i18n.ts.reloadToApplySetting,
		});

		if (canceled) return;

		unisonReload();
	} else {
		os.alert({
			type: 'error',
		});
	}
}
</script>
