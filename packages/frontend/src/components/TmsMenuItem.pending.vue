<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	role="menuitem"
	tabindex="0"
	:class="[$style.pending, $style.item]"
>
	<span><MkEllipsis/></span>
</div>
</template>

<script lang="ts" setup>
import { type TmsMenuItemPendingProps } from '@/components/TmsMenuItem.impl.js';

const props = defineProps<TmsMenuItemPendingProps>();
</script>

<style lang="scss" module>
</style>
