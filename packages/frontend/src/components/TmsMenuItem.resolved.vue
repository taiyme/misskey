<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<!-- IMenuDivider -->
<div
	v-if="props.resolvedItem.type === 'divider'"
	role="separator"
	tabindex="-1"
	:class="$style.divider"
></div>

<!-- IMenuLabel -->
<span
	v-else-if="props.resolvedItem.type === 'label'"
	role="menuitem"
	tabindex="-1"
	:class="[$style.item, $style.label]"
>
	<span style="opacity: 0.7;">{{ props.resolvedItem.text }}</span>
</span>

<!-- IMenuLink -->
<MkA
	v-else-if="props.resolvedItem.type === 'link'"
	role="menuitem"
	tabindex="0"
	:class="['_button', $style.item]"
	:to="props.resolvedItem.to"
	@click.passive="close(true)"
	@mouseenter.passive="onItemMouseEnter"
	@mouseleave.passive="onItemMouseLeave"
>
	<i v-if="props.resolvedItem.icon" :class="['ti-fw', props.resolvedItem.icon, $style.icon]"></i>
	<MkAvatar v-if="props.resolvedItem.avatar" :user="props.resolvedItem.avatar" :class="$style.avatar"/>
	<div :class="$style.itemContent">
		<span :class="$style.itemContentText">{{ props.resolvedItem.text }}</span>
		<span v-if="toValue(props.resolvedItem.indicate)" :class="$style.indicator"><i class="_indicatorCircle"></i></span>
	</div>
</MkA>

<!-- IMenuA -->
<a
	v-else-if="props.resolvedItem.type === 'a'"
	role="menuitem"
	tabindex="0"
	:class="['_button', $style.item]"
	:href="props.resolvedItem.href"
	:target="props.resolvedItem.target"
	rel="nofollow noopener"
	:download="props.resolvedItem.download"
	@click.passive="close(true)"
	@mouseenter.passive="onItemMouseEnter"
	@mouseleave.passive="onItemMouseLeave"
>
	<i v-if="props.resolvedItem.icon" :class="['ti-fw', props.resolvedItem.icon, $style.icon]"></i>
	<div :class="$style.itemContent">
		<span :class="$style.itemContentText">{{ props.resolvedItem.text }}</span>
		<span v-if="toValue(props.resolvedItem.indicate)" :class="$style.indicator"><i class="_indicatorCircle"></i></span>
	</div>
</a>

<!-- IMenuUser -->
<button
	v-else-if="props.resolvedItem.type === 'user'"
	role="menuitem"
	tabindex="0"
	:class="['_button', $style.item, {
		[$style.active]: toValue(props.resolvedItem.active),
	}]"
	@click.prevent="exprClickedAction(props.resolvedItem, $event, true)"
	@mouseenter.passive="onItemMouseEnter"
	@mouseleave.passive="onItemMouseLeave"
>
	<MkAvatar :user="props.resolvedItem.user" :class="$style.avatar"/>
	<MkUserName :user="props.resolvedItem.user"/>
	<div v-if="toValue(props.resolvedItem.indicate)" :class="$style.itemContent">
		<span :class="$style.indicator"><i class="_indicatorCircle"></i></span>
	</div>
</button>

<!-- IMenuSwitch -->
<button
	v-else-if="props.resolvedItem.type === 'switch'"
	role="menuitemcheckbox"
	tabindex="0"
	:aria-checked="props.resolvedItem.getter()"
	:class="['_button', $style.item]"
	:disabled="toValue(props.resolvedItem.disabled)"
	@click.prevent="exprToggleSwitch(props.resolvedItem)"
	@keydown="filterKeyboardEnterOrSpace(() => exprToggleSwitch(props.resolvedItem))($event)"
	@mouseenter.passive="onItemMouseEnter"
	@mouseleave.passive="onItemMouseLeave"
>
	<i v-if="props.resolvedItem.icon" :class="['ti-fw', props.resolvedItem.icon, $style.icon]"></i>
	<XSwitchButton v-else :class="$style.switchButton" :checked="props.resolvedItem.getter()" :disabled="toValue(props.resolvedItem.disabled)" @toggle="exprToggleSwitch(props.resolvedItem)"/>
	<div :class="$style.itemContent">
		<span :class="[$style.itemContentText, { [$style.switchText]: !props.resolvedItem.icon }]">{{ props.resolvedItem.text }}</span>
		<XSwitchButton v-if="props.resolvedItem.icon" :class="[$style.switchButton, $style.caret]" :checked="props.resolvedItem.getter()" :disabled="toValue(props.resolvedItem.disabled)" @toggle="exprToggleSwitch(props.resolvedItem)"/>
	</div>
</button>

<!-- IMenuRadio -->
<button
	v-else-if="props.resolvedItem.type === 'radio'"
	role="menuitem"
	tabindex="0"
	:class="['_button', $style.item, $style.parent, {
		[$style.active]: childShowingItem === props.resolvedItem,
	}]"
	:disabled="toValue(props.resolvedItem.disabled)"
	@mouseenter.prevent="preferClick ? null : showRadioOptions(props.resolvedItem, $event)"
	@click.prevent="!preferClick ? null : showRadioOptions(props.resolvedItem, $event)"
	@keydown="filterKeyboardEnterOrSpace(ev => showRadioOptions(props.resolvedItem, ev))($event)"
>
	<i v-if="props.resolvedItem.icon" :class="['ti-fw', props.resolvedItem.icon, $style.icon]"></i>
	<div :class="$style.itemContent">
		<span :class="$style.itemContentText">{{ props.resolvedItem.text }}</span>
		<span :class="$style.caret"><i class="ti ti-chevron-right ti-fw"></i></span>
	</div>
</button>

<!-- IMenuRadioOption -->
<button
	v-else-if="props.resolvedItem.type === 'radioOption'"
	role="menuitemradio"
	tabindex="0"
	:aria-checked="toValue(props.resolvedItem.active)"
	:class="['_button', $style.item, $style.radio, {
		[$style.active]: toValue(props.resolvedItem.active),
	}]"
	@click.prevent="exprClickedAction(props.resolvedItem, $event, false)"
	@mouseenter.passive="onItemMouseEnter"
	@mouseleave.passive="onItemMouseLeave"
>
	<div :class="$style.icon">
		<span
			:class="[$style.radioIcon, {
				[$style.radioChecked]: toValue(props.resolvedItem.active),
			}]"
		></span>
	</div>
	<div :class="$style.itemContent">
		<span :class="$style.itemContentText">{{ props.resolvedItem.text }}</span>
	</div>
</button>

<!-- IMenuParent -->
<button
	v-else-if="props.resolvedItem.type === 'parent'"
	role="menuitem"
	tabindex="0"
	:class="['_button', $style.item, $style.parent, {
		[$style.active]: childShowingItem === props.resolvedItem,
	}]"
	@mouseenter.prevent="preferClick ? null : showChildren(props.resolvedItem, $event)"
	@click.prevent="!preferClick ? null : showChildren(props.resolvedItem, $event)"
	@keydown="filterKeyboardEnterOrSpace(ev => showChildren(props.resolvedItem, ev))($event)"
>
	<i v-if="props.resolvedItem.icon" :class="['ti-fw', props.resolvedItem.icon, $style.icon]"></i>
	<div :class="$style.itemContent">
		<span :class="$style.itemContentText">{{ props.resolvedItem.text }}</span>
		<span :class="$style.caret"><i class="ti ti-chevron-right ti-fw"></i></span>
	</div>
</button>

<!-- IMenuButton -->
<button
	v-else
	role="menuitem"
	tabindex="0"
	:class="['_button', $style.item, {
		[$style.active]: toValue(props.resolvedItem.active),
		[$style.danger]: toValue(props.resolvedItem.danger),
	}]"
	@click.prevent="exprClickedAction(props.resolvedItem, $event, true)"
	@mouseenter.passive="onItemMouseEnter"
	@mouseleave.passive="onItemMouseLeave"
>
	<i v-if="props.resolvedItem.icon" :class="['ti-fw', props.resolvedItem.icon, $style.icon]"></i>
	<MkAvatar v-if="props.resolvedItem.avatar" :user="props.resolvedItem.avatar" :class="$style.avatar"/>
	<div :class="$style.itemContent">
		<span :class="$style.itemContentText">{{ props.resolvedItem.text }}</span>
		<span v-if="toValue(props.resolvedItem.indicate)" :class="$style.indicator"><i class="_indicatorCircle"></i></span>
	</div>
</button>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, toValue } from 'vue';
import { filterKeyboardEnterOrSpace } from '@/scripts/tms/filter-keyboard.js';
import { type TmsMenuItemResolvedProps, exprClickedAction, exprToggleSwitch } from '@/components/TmsMenuItem.impl.js';

const XSwitchButton = defineAsyncComponent(() => import('@/components/MkSwitch.button.vue'));

const props = defineProps<TmsMenuItemResolvedProps>();

// TODO: まだ実装していない
const onItemMouseEnter = (...args: unknown[]) => {};
const onItemMouseLeave = (...args: unknown[]) => {};
const showChildren = (...args: unknown[]) => {};
const showRadioOptions = (...args: unknown[]) => {};
const close = (...args: unknown[]) => {};
const preferClick = false;
const childShowingItem = null;
</script>

<style lang="scss" module>
.parent {
	> * {
		// NOTE: 子要素でclickイベントを発生させない https://github.com/misskey-dev/misskey/commit/76c4fed
		pointer-events: none;
	}
}
</style>
