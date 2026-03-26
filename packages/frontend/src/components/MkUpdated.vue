<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModal ref="modal" preferType="dialog" :zPriority="'middle'" @click="modal?.close()" @closed="emit('closed')">
	<div :class="$style.root">
		<div :class="$style.title"><MkSparkle>{{ taiymeUpdated }}</MkSparkle></div>
		<div :class="$style.version">✨{{ version }}🚀</div>
		<MkButton full @click="whatIsNew">{{ i18n.ts.whatIsNew }}</MkButton>
		<MkButton :class="$style.gotIt" primary full @click="modal?.close()">{{ i18n.ts.gotIt }}</MkButton>
	</div>
</MkModal>
</template>

<script lang="ts" setup>
import { computed, onMounted, useTemplateRef } from 'vue';
import { version } from '@@/js/config.js';
import MkModal from '@/components/MkModal.vue';
import MkButton from '@/components/MkButton.vue';
import MkSparkle from '@/components/MkSparkle.vue';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import { confetti } from '@/utility/confetti.js';

const modal = useTemplateRef('modal');

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

const taiymeUpdated = computed(() => {
	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	const serverName = instance.shortName || instance.name || null;
	if (serverName != null) {
		return i18n.tsx._taiyme.serverUpdated({ serverName });
	}
	return i18n.ts._taiyme.taiymeUpdated;
});

function whatIsNew() {
	modal.value?.close();
	window.open(`https://github.com/taiyme/misskey/releases/tag/${version}`, '_blank');
}

onMounted(() => {
	confetti({
		duration: 1000 * 3,
	});
});
</script>

<style lang="scss" module>
.root {
	margin: auto;
	position: relative;
	padding: 32px;
	min-width: 320px;
	max-width: 480px;
	box-sizing: border-box;
	text-align: center;
	background: var(--MI_THEME-panel);
	border-radius: var(--MI-radius);
}

.title {
	font-weight: bold;
}

.version {
	margin: 1em 0;
}

.gotIt {
	margin: 8px 0 0 0;
}
</style>
