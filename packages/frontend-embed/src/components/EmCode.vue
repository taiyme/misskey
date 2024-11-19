<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<EmA :to="notePage(appearNote)" :class="$style.link" class="_button">
		<i class="ti ti-external-link"></i>
	</EmA>
	<pre :class="$style.pre"><code :class="$style.code">{{ code }}</code></pre>
</div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { DI } from '@/di.js';
import EmA from '@/components/EmA.vue';
import { notePage } from '@/utils.js';

const appearNote = inject(DI.appearNote)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

defineProps<{
	code: string;
}>();
</script>

<style lang="scss" module>
.root {
	position: relative;
}

.link {
	position: absolute;
	top: 8px;
	right: 8px;
	opacity: 0.5;

	&:hover {
		text-decoration: none;
		opacity: 0.8;
		color: var(--MI_THEME-link);
	}
}

.pre {
	display: block;
	overflow-wrap: anywhere;
	background: var(--MI_THEME-bg);
	padding: 1em;
	margin: 0.5em 0;
	overflow: auto;
	border-radius: 8px;
}

.code {
	font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
}
</style>
