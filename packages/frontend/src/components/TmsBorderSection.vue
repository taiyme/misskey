<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	:class="[$style.root, {
		[$style.active]: active,
	}]"
>
	<div :class="$style.header">
		<div v-if="$slots.label" :class="$style.headerLabel">
			<slot name="label"></slot>
		</div>
		<div v-if="$slots.button" :class="['_buttonsCenter', $style.headerButton]">
			<slot name="button"></slot>
		</div>
	</div>
	<div :class="$style.contents">
		<slot></slot>
	</div>
</div>
</template>

<script lang="ts" setup>
defineProps<{
	active?: boolean;
}>();
</script>

<style lang="scss" module>
.root {
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 8px;
	border-left: solid 2px var(--divider);
	padding: 4px 4px 4px 16px;
	transition: border-color 0.1s ease-out;

	&.active {
		border-left-color: var(--accent);
	}
}

.header {
	display: flex;
	align-items: center;
	gap: 16px;

	&:empty {
		display: none;
	}
}

.headerLabel {
	font-weight: bold;
	min-width: 0; // SEE: https://johnykei.net/front-end/css/flex-item-with-min-width-0-to-fix-overflowed-flexbox/
}

.headerButton {
	flex-shrink: 0;
}

.contents {
	&:empty {
		display: none;
	}
}
</style>
