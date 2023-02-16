<template>
<MkStickyContainer>
	<template #header><XHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<div class="_formRoot">
		<template v-if="tab === 'overview'">
			<FormSection>
				<MkKeyValue class="_formBlock" :copy="version">
					<template #key>{{ i18n.ts.version }}</template>
					<template #value>{{ version }}</template>
				</MkKeyValue>
			</FormSection>

			<FormSection>
				<MkKeyValue class="_formBlock">
					<template #key>taiyme/misskeyについて</template>
					<template #value>taiyme/misskeyは、taiyによって無償でメンテナンスされています。<br>継続して提供するためにも、開発のサポートや寄付をお願いします。</template>
				</MkKeyValue>
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
		</template>

		<template v-else-if="tab === 'settings'">
			<FormSection>
				<MkInfo warn class="_formBlock">設定はページリロード後に反映されます。</MkInfo>

				<FormSwitch v-model="tmsVerticalInstanceTicker" class="_formBlock">
					ノートのインスタンス情報を左端に表示
					<template #caption>タイムライン上のインスタンス情報を左端に表示します。</template>
				</FormSwitch>

				<FormSwitch v-model="tmsIsLongEnabled" class="_formBlock">
					ノートを畳む
					<template #caption>タイムライン上のノートが特定の条件の場合、畳んで表示します。無効にすると常に展開して表示します。</template>
				</FormSwitch>
				<FormFolder>
					<template #label>ノートを畳む条件</template>
					<template v-if="tmsIsLongEnabled" #suffix>有効</template>
					<template v-else #suffix>無効</template>

					<MkInfo class="_formBlock">0以上の整数を指定してください。0を指定すると条件が無効になります。</MkInfo>

					<FormInput v-model="tmsIsLongTextElHeight" type="number" class="_formBlock">
						<template #label>ノート本文の高さ</template>
						<template #suffix>px</template>
						<template #caption>タイムライン上のノートがこの高さを超えた場合、畳んで表示します。ピクセル単位で指定してください。</template>
					</FormInput>
					<FormInput v-model="tmsIsLongFilesLength" type="number" class="_formBlock">
						<template #label>添付ファイルの個数</template>
						<template #suffix>個</template>
						<template #caption>タイムライン上のノートの添付ファイルがこの個数を超えた場合、畳んで表示します。</template>
					</FormInput>
					<FormInput v-model="tmsIsLongUrlsLength" type="number" class="_formBlock">
						<template #label>URLの個数</template>
						<template #suffix>個</template>
						<template #caption>タイムライン上のノートのURLがこの個数を超えた場合、畳んで表示します。</template>
					</FormInput>
					<FormInput v-model="tmsIsLongPollLength" type="number" class="_formBlock">
						<template #label>アンケートの選択肢の個数</template>
						<template #suffix>個</template>
						<template #caption>タイムライン上のノートのアンケートの選択肢がこの個数を超えた場合、畳んで表示します。</template>
					</FormInput>
				</FormFolder>
			</FormSection>
		</template>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { } from 'vue';
import XHeader from '../admin/_header_.vue';
import FormLink from '@/components/form/link.vue';
import FormSwitch from '@/components/form/switch.vue';
import FormInput from '@/components/form/input.vue';
import FormSection from '@/components/form/section.vue';
import FormFolder from '@/components/form/folder.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkInfo from '@/components/MkInfo.vue';
import * as os from '@/os';
import { unisonReload } from '@/scripts/unison-reload';
import { i18n } from '@/i18n';
import { version } from '@/config';
import { defaultStore } from '@/store';

let tab = $ref('overview');

const headerTabs = $computed(() => [{
	key: 'overview',
	title: i18n.ts.overview,
	icon: 'ti ti-info-circle',
}, {
	key: 'settings',
	title: i18n.ts.settings,
	icon: 'ti ti-settings',
}]);

const headerActions = $computed(() => [{
	icon: 'ti ti-check',
	text: i18n.ts.save,
	handler: save,
}]);

const tmsVerticalInstanceTicker = $ref(defaultStore.state.tmsVerticalInstanceTicker);
const tmsIsLongEnabled = $ref(defaultStore.state.tmsIsLongEnabled);
const tmsIsLongTextElHeight = $ref(defaultStore.state.tmsIsLongTextElHeight);
const tmsIsLongFilesLength = $ref(defaultStore.state.tmsIsLongFilesLength);
const tmsIsLongUrlsLength = $ref(defaultStore.state.tmsIsLongUrlsLength);
const tmsIsLongPollLength = $ref(defaultStore.state.tmsIsLongPollLength);

async function check() {
	const isNumberInRange = (x: number, min?: number, max?: number): boolean => {
		if (!Number.isInteger(x)) return false;
		if (Math.sign(x) === -1) return false;
		if (min == null) min = -Infinity;
		if (max == null) max = Infinity;
		return (min <= x) && (x <= max);
	};
	return (
		isNumberInRange(tmsIsLongTextElHeight, 0) &&
		isNumberInRange(tmsIsLongFilesLength, 0) &&
		isNumberInRange(tmsIsLongUrlsLength, 0) &&
		isNumberInRange(tmsIsLongPollLength, 0)
	);
}

async function save() {
	if (await check()) {
		defaultStore.set('tmsVerticalInstanceTicker', tmsVerticalInstanceTicker);
		defaultStore.set('tmsIsLongEnabled', tmsIsLongEnabled);
		defaultStore.set('tmsIsLongTextElHeight', tmsIsLongTextElHeight);
		defaultStore.set('tmsIsLongFilesLength', tmsIsLongFilesLength);
		defaultStore.set('tmsIsLongUrlsLength', tmsIsLongUrlsLength);
		defaultStore.set('tmsIsLongPollLength', tmsIsLongPollLength);

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
