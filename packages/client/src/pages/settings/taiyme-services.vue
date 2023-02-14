<template>
<div class="_formRoot">
	<FormSection>
		<FormSplit>
			<MkKeyValue class="_formBlock" :copy="version">
				<template #key>{{ i18n.ts.version }}</template>
				<template #value>{{ version }}</template>
			</MkKeyValue>
			<MkKeyValue class="_formBlock" copy="@taiy@mk.taiy.me">
				<template #key>{{ i18n.ts.developer }}</template>
				<template #value>@taiy@mk.taiy.me</template>
			</MkKeyValue>
		</FormSplit>
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
				<template #suffix>donate</template>
			</FormLink>
		</div>
	</FormSection>

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

			<FormInput v-model="tmsIsLongTextElHeight" type="number" manual-save class="_formBlock">
				<template #label>ノート本文の高さ</template>
				<template #suffix>px</template>
				<template #caption>タイムライン上のノートがこの高さを超えた場合、畳んで表示します。ピクセル単位で指定してください。</template>
			</FormInput>
			<FormInput v-model="tmsIsLongFilesLength" type="number" manual-save class="_formBlock">
				<template #label>添付ファイルの個数</template>
				<template #suffix>個</template>
				<template #caption>タイムライン上のノートの添付ファイルがこの個数を超えた場合、畳んで表示します。</template>
			</FormInput>
			<FormInput v-model="tmsIsLongUrlsLength" type="number" manual-save class="_formBlock">
				<template #label>URLの個数</template>
				<template #suffix>個</template>
				<template #caption>タイムライン上のノートのURLがこの個数を超えた場合、畳んで表示します。</template>
			</FormInput>
		</FormFolder>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import FormLink from '@/components/form/link.vue';
import FormSwitch from '@/components/form/switch.vue';
import FormInput from '@/components/form/input.vue';
import FormSection from '@/components/form/section.vue';
import FormSplit from '@/components/form/split.vue';
import FormFolder from '@/components/form/folder.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkInfo from '@/components/MkInfo.vue';
import { i18n } from '@/i18n';
import { version } from '@/config';
import { defaultStore } from '@/store';

const tmsVerticalInstanceTicker = computed(defaultStore.makeGetterSetter('tmsVerticalInstanceTicker'));
const tmsIsLongEnabled = computed(defaultStore.makeGetterSetter('tmsIsLongEnabled'));
const tmsIsLongTextElHeight = computed(defaultStore.makeGetterSetter('tmsIsLongTextElHeight'));
const tmsIsLongFilesLength = computed(defaultStore.makeGetterSetter('tmsIsLongFilesLength'));
const tmsIsLongUrlsLength = computed(defaultStore.makeGetterSetter('tmsIsLongUrlsLength'));
</script>
