<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	v-size="{ max: [250, 150], min: [] }"
	:class="{
		[$style.root]: true,
		[$style.hidden]: hide,
		[$style.visible]: !hide,
		[$style.sensitive]: image.isSensitive && defaultStore.state.highlightSensitiveMedia,
	}"
	:style="{
		'--c': (
			defaultStore.reactiveState.darkMode.value
				? 'rgba(255, 255, 255, 0.02)'
				: 'rgba(0, 0, 0, 0.02)'
		),
	}"
	@click="onClick"
>
	<component
		:is="disableImageLink ? 'div' : 'a'"
		v-bind="disableImageLink ? {
			title: image.name,
			class: $style.imageContainer,
		} : {
			title: image.name,
			class: $style.imageContainer,
			href: image.url,
			style: 'cursor: zoom-in;'
		}"
	>
		<MkImgWithBlurhash
			:hash="image.blurhash"
			:src="(defaultStore.state.enableDataSaverMode && hide) ? null : url"
			:forceBlurhash="hide"
			:cover="hide || cover"
			:alt="image.comment || image.name"
			:title="image.comment || image.name"
			:width="image.properties.width"
			:height="image.properties.height"
			:style="hide ? 'filter: brightness(0.7);' : undefined"
		/>
	</component>
	<template v-if="hide">
		<div :class="['_noSelect', $style.hiddenText]">
			<div :class="$style.hiddenTextWrapper">
				<b v-if="image.isSensitive" style="display: block;">
					<i class="ti ti-eye-exclamation"></i> {{ i18n.ts.sensitive }}{{ defaultStore.state.enableDataSaverMode ? ` (${i18n.ts.image}${image.size ? ` ${bytes(image.size)}` : ''})` : '' }}
				</b>
				<b v-else style="display: block;">
					<i class="ti ti-photo"></i> {{ defaultStore.state.enableDataSaverMode && image.size ? bytes(image.size) : i18n.ts.image }}
				</b>
				<span v-if="controls" style="display: block;">{{ i18n.ts.clickToShow }}</span>
			</div>
		</div>
	</template>
	<template v-else-if="controls">
		<button v-tooltip="i18n.ts.hide" :class="['_button', $style.hide]" @click.stop="hide = true">
			<div :class="$style.hideInner"><i class="ti ti-eye-off" style="display: block;"></i></div>
		</button>
		<button :class="['_button', $style.menu]" @click.stop="showMenu">
			<div :class="$style.menuInner"><i class="ti ti-dots" style="display: block;"></i></div>
		</button>
		<div :class="$style.indicators" @click.stop="() => {}">
			<button v-if="['image/gif', 'image/apng'].includes(image.type)" v-tooltip:dialog="i18n.ts._tms.gifInfo" :class="['_button', $style.indicator]">GIF</button>
			<button v-if="image.comment" v-tooltip:dialog="image.comment" :class="['_button', $style.indicator]">ALT</button>
			<button v-if="image.isSensitive" v-tooltip:dialog="i18n.ts._tms.sensitiveInfo" :class="['_button', $style.indicator]">NSFW</button>
		</div>
	</template>
</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type * as Misskey from 'misskey-js';
import { getStaticImageUrl } from '@/scripts/media-proxy.js';
import bytes from '@/filters/bytes.js';
import MkImgWithBlurhash from '@/components/MkImgWithBlurhash.vue';
import { defaultStore } from '@/store.js';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';
import { iAmModerator } from '@/account.js';
import { MenuItem } from '@/types/menu.js';

const props = withDefaults(defineProps<{
	image: Misskey.entities.DriveFile;
	raw?: boolean;
	cover?: boolean;
	disableImageLink?: boolean;
	controls?: boolean;
}>(), {
	cover: false,
	disableImageLink: false,
	controls: true,
});

const hide = ref(true);
const sensitive = ref(false);

watch(() => props.image, () => {
	hide.value = (defaultStore.state.nsfw === 'force' || defaultStore.state.enableDataSaverMode) || (props.image.isSensitive && defaultStore.state.nsfw !== 'ignore');
	sensitive.value = (props.image.isSensitive && defaultStore.state.highlightSensitiveMedia);
}, {
	deep: true,
	immediate: true,
});

const url = computed(() => {
	return (
		(props.raw || defaultStore.state.loadRawImages)
			? props.image.url
			: defaultStore.state.disableShowingAnimatedImages
				? getStaticImageUrl(props.image.url)
				: props.image.thumbnailUrl
	);
})

const onClick = (): void => {
	if (!props.controls) return;
	if (hide.value) {
		hide.value = false;
	}
};

const showMenu = (ev: MouseEvent): void => {
	const menu: MenuItem[] = [
		{
			text: i18n.ts.hide,
			icon: 'ti ti-eye-off',
			action: () => {
				hide.value = true;
			},
		},
		...iAmModerator ? [
			{
				text: i18n.ts.markAsSensitive,
				icon: 'ti ti-eye-exclamation',
				danger: true,
				action: () => {
					os.apiWithDialog('drive/files/update', {
						fileId: props.image.id,
						isSensitive: true,
					});
				},
			}
		] : [],
	];
	os.popupMenu(menu, ev.currentTarget ?? ev.target);
};

</script>

<style lang="scss" module>
.root {
	--gap: 8px;
}

.hidden {
	position: relative;
}

.sensitive {
	position: relative;

	&::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		border-radius: inherit;
		box-shadow: inset 0 0 0 4px var(--warn);
	}
}

.hiddenText {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
}

.hiddenTextWrapper {
	display: table-cell;
	text-align: center;
	font-size: 0.8em;
	color: #fff;
}

.visible {
	position: relative;
	// box-shadow: 0 0 0 1px var(--divider) inset;
	background: var(--bg);
	background-image: linear-gradient(
		45deg,
		var(--c) 16.67%,
		var(--bg) 16.67%,
		var(--bg) 50%,
		var(--c) 50%,
		var(--c) 66.67%,
		var(--bg) 66.67%,
		var(--bg) 100%
	);
	background-size: 16px 16px;
}

%ButtonContainer {
	position: absolute;
	top: auto;
	right: auto;
	bottom: auto;
	left: auto;
	display: flex;
	gap: calc(var(--gap, 8px) * 0.75);
	padding: var(--gap, 8px);
	font-size: 0.8em;
	text-align: center;

	&:empty {
		display: none;
	}
}

%ButtonInner {
	display: block;
	border-radius: 6px;
	background-color: rgba(0, 0, 0, 0.3);
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
	color: #fff;
	padding: calc(var(--gap, 8px) * 0.75) var(--gap, 8px);

	&:empty {
		display: none;
	}
}

.hide {
	@extend %ButtonContainer;
	top: 0;
	right: 0;
}

.hideInner {
	@extend %ButtonInner;
}

.menu {
	@extend %ButtonContainer;
	right: 0;
	bottom: 0;
}

.menuInner {
	@extend %ButtonInner;
}

.indicators {
	@extend %ButtonContainer;
	top: 0;
	left: 0;
}

.indicator {
	@extend %ButtonInner;
	font-weight: bold;
}

:global(:where(.max-width_250px)) {
	&.root {
		--gap: 6px;
	}
}

:global(:where(.max-width_150px)) {
	&.root {
		--gap: 4px;
	}

	&:where(.root) {
		.hide {
			display: none;
		}

		.indicators {
			display: none;
		}
	}
}

.imageContainer {
	display: block;
	overflow: hidden;
	width: 100%;
	height: 100%;
	background-position: center;
	background-size: contain;
	background-repeat: no-repeat;
}
</style>
