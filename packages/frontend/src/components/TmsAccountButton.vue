<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<button
	v-if="$i != null"
	v-tooltip.noDelay.right="tooltipRef"
	:class="['_button', $style.root]"
	@mousedown.prevent.stop="openAccountMenu"
	@contextmenu.prevent.stop="openAccountMenu"
>
	<MkAvatar
		v-if="props.iconOnly"
		:user="$i"
		:class="['_ghost', $style.iconOnly]"
	/>
	<div
		v-else
		:class="['_ghost', $style.account]"
	>
		<MkAvatar :user="$i" :class="$style.avatar"/>
		<MkAcct :user="$i" :class="$style.acct"/>
		<i :class="$style.mark" class="ti ti-dots-vertical"></i>
	</div>
</button>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { $i, openAccountMenu as openAccountMenu_ } from '@/account.js';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	iconOnly?: boolean;
	tooltip?: boolean;
}>();

const tooltipRef = computed(() => {
	if (!props.tooltip) return;
	if ($i == null) return i18n.ts.account;
	return `${i18n.ts.account}: @${$i.username}`;
});

const openAccountMenu = (ev: MouseEvent) => {
	openAccountMenu_({
		withExtraOperation: true,
	}, ev);
};
</script>

<style lang="scss" module>
.root {
	box-sizing: border-box;
	overflow: clip;
	display: block;
	width: 100%;
	padding: var(--tmsAccountButton-padding, 0);

	&:focus-visible {
		outline: none;

		> .iconOnly,
		> .account {
			outline: var(--MI_THEME-focus) solid 2px;
			outline-offset: 2px;
		}
	}
}

.iconOnly {
	display: block;
	margin: 0 auto;
	width: 38px;
	height: 38px;
}

.account {
	overflow: clip;
	border-radius: 6px;
	display: flex;
	align-items: center;
}

.avatar {
	display: block;
	margin: 0 8px 0 13px;
	width: 32px;
	height: 32px;
}

.acct {
	display: block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.mark {
	display: flex;
	margin: 0 6px 0 auto;
}
</style>
