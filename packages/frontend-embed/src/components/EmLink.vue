<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<component
	:is="self ? EmA : 'a'"
	style="word-break: break-all;"
	class="_link"
	:[attr]="self ? url.substring(local.length) : url"
	:rel="rel ?? 'nofollow noopener'"
	:target="target"
	:title="url"
>
	<slot></slot>
	<i v-if="target === '_blank'" class="ti ti-external-link" :class="$style.icon"></i>
</component>
</template>

<script lang="ts" setup>
import { url as local } from '@@/js/config.js';
import EmA from '@/components/EmA.vue';

const props = defineProps<{
	url: string;
	rel?: null | string;
}>();

const self = props.url.startsWith(local);
const attr = self ? 'to' : 'href';
const target = self ? null : '_blank';
</script>

<style lang="scss" module>
.icon {
	padding-left: 2px;
	font-size: .9em;
}
</style>
