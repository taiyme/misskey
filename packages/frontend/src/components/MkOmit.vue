<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.content, { [$style.omitted]: omitted }]">
	<div ref="contentEl">
		<slot></slot>
	</div>
	<button v-if="omitted" :class="['_button', $style.showMoreFade]" @click="showMore">
		<span v-if="!hiddenFadeButton" :class="$style.fadeLabel">{{ i18n.ts.showMore }}</span>
	</button>
	<button v-else-if="toggleable && manuallyOperated && !hiddenFadeButton" :class="['_button', $style.showLessFade]" @click="showLess">
		<span :class="$style.fadeLabel">{{ i18n.ts.showLess }}</span>
	</button>
</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, shallowRef, ref } from 'vue';
import { i18n } from '@/i18n.js';

const props = withDefaults(defineProps<{
	maxHeight?: number;
	toggleable?: boolean;
	hiddenFadeButton?: boolean;
}>(), {
	maxHeight: 200,
	toggleable: false,
	hiddenFadeButton: false,
});

const contentEl = shallowRef<HTMLElement | null>(null);
const omitted = ref(false);
const manuallyOperated = ref(false);

const showMore = () => {
	manuallyOperated.value = true;
	omitted.value = false;
};

const showLess = () => {
	manuallyOperated.value = true;
	omitted.value = true;
};

const calcOmit = () => {
	if (manuallyOperated.value || contentEl.value == null) return;
	omitted.value = contentEl.value.offsetHeight > props.maxHeight;
};

const omitObserver = new ResizeObserver(() => {
	calcOmit();
});

onMounted(() => {
	calcOmit();
	if (contentEl.value != null) {
		omitObserver.observe(contentEl.value);
	}
});

onUnmounted(() => {
	omitObserver.disconnect();
});
</script>

<style lang="scss" module>
.content {
	--MI-stickyTop: 0px;
}

.omitted {
	position: relative;
	min-height: 64px; // .showMoreFade
	max-height: v-bind("props.maxHeight + 'px'");
	overflow: hidden; // fallback (overflow: clip)
	overflow: clip;
}

.showMoreFade {
	display: block;
	position: absolute;
	z-index: 10;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 64px; // .omitted
	background: linear-gradient(0deg, var(--MI_THEME-panel), color(from var(--MI_THEME-panel) srgb r g b / 0));
}

.showLessFade {
	display: block;
	position: sticky;
	z-index: 10;
	bottom: var(--MI-stickyBottom, 0px);
	width: 100%;
	height: 64px;
}

.showMoreFade,
.showLessFade {
	&:hover {
		> .fadeLabel {
			background: var(--MI_THEME-panelHighlight);
		}
	}

	> .fadeLabel {
		display: inline-block;
		background: var(--MI_THEME-panel);
		padding: 6px 10px;
		font-size: 0.8em;
		border-radius: 999px;
		box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
	}
}
</style>
