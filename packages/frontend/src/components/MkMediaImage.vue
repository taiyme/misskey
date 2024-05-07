<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.cqRoot">
	<div
		:class="{
			[$style.root]: true,
			[$style.visible]: !hide,
			[$style.sensitive]: sensitive,
		}"
		@click="onClick"
		@contextmenu.stop="() => {}"
	>
		<component
			:is="disableImageLink ? 'div' : 'a'"
			v-bind="disableImageLink ? {
				title: reactiveImage.name,
				class: $style.imageContainer,
			} : {
				title: reactiveImage.name,
				class: $style.imageContainer,
				href: reactiveImage.url,
				style: 'cursor: zoom-in;'
			}"
		>
			<MkImgWithBlurhash
				:hash="reactiveImage.blurhash"
				:src="(defaultStore.state.dataSaver.media && hide) ? null : url"
				:forceBlurhash="hide"
				:cover="hide || cover"
				:alt="reactiveImage.comment || reactiveImage.name"
				:title="reactiveImage.comment || reactiveImage.name"
				:width="reactiveImage.properties.width"
				:height="reactiveImage.properties.height"
				:style="hide ? 'filter: brightness(0.7);' : undefined"
			/>
		</component>
		<template v-if="hide">
			<div :class="['_noSelect', $style.hiddenText]">
				<div :class="$style.hiddenTextWrapper">
					<b v-if="reactiveImage.isSensitive" style="display: block;">
						<i class="ti ti-eye-exclamation"></i> {{ i18n.ts.sensitive }}{{ defaultStore.state.dataSaver.media ? ` (${i18n.ts.image}${reactiveImage.size ? ` ${bytes(reactiveImage.size)}` : ''})` : '' }}
					</b>
					<b v-else style="display: block;">
						<i class="ti ti-photo"></i> {{ defaultStore.state.dataSaver.media && reactiveImage.size ? bytes(reactiveImage.size) : i18n.ts.image }}
					</b>
					<span v-if="controls" style="display: block;">{{ i18n.ts.clickToShow }}</span>
				</div>
			</div>
		</template>
		<template v-else-if="controls">
			<div :class="$style.controlsUpperRight">
				<button
					:class="['_button', $style.controlItem]"
					v-tooltip="i18n.ts.hide"
					@click.stop="hide = true"
				>
					<div :class="$style.controlButton"><i class="ti ti-eye-off"></i></div>
				</button>
			</div>
			<div :class="$style.controlsLowerRight">
				<button
					:class="['_button', $style.controlItem]"
					v-tooltip="i18n.ts.menu"
					@click.stop="showMenu"
				>
					<div :class="$style.controlButton"><i class="ti ti-dots"></i></div>
				</button>
			</div>
			<div :class="$style.controlsLowerLeft">
			</div>
			<div :class="$style.controlsUpperLeft">
				<button
					v-if="['image/gif', 'image/apng'].includes(reactiveImage.type)"
					v-tooltip:dialog="i18n.ts._tms.displayingGifFiles"
					:class="['_button', $style.controlItem]"
				>
					<div :class="$style.controlButton"><span>GIF</span></div>
				</button>
				<button
					v-if="reactiveImage.comment"
					v-tooltip:dialog="reactiveImage.comment"
					:class="['_button', $style.controlItem]"
				>
					<div :class="$style.controlButton"><span>ALT</span></div>
				</button>
				<button
					v-if="reactiveImage.isSensitive"
					v-tooltip:dialog="i18n.ts._tms.displayingSensitiveFiles"
					:class="['_button', $style.controlItem]"
				>
					<div :class="$style.controlButton"><span>NSFW</span></div>
				</button>
			</div>
		</template>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, watch } from 'vue';
import * as Misskey from 'misskey-js';
import { $i, iAmModerator } from '@/account.js';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';
import { defaultStore } from '@/store.js';
import { deepClone } from '@/scripts/clone.js';
import { getStaticImageUrl } from '@/scripts/media-proxy.js';
import bytes from '@/filters/bytes.js';
import { MenuItem } from '@/types/menu.js';
import MkImgWithBlurhash from '@/components/MkImgWithBlurhash.vue';

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

const mock = inject<boolean>('mock', false);

const reactiveImage = ref(deepClone(props.image));

const hide = ref(true);
const sensitive = ref(false);

const iAmOwner = computed(() => {
	if ($i == null) return false;
	if (reactiveImage.value.userId == null) return false;
	return $i.id === reactiveImage.value.userId;
});

const url = computed(() => {
	return (
		(props.raw || defaultStore.state.loadRawImages)
			? reactiveImage.value.url
			: defaultStore.state.disableShowingAnimatedImages
				? getStaticImageUrl(reactiveImage.value.url)
				: reactiveImage.value.thumbnailUrl
	);
});

watch(() => props.image, () => {
	reactiveImage.value = deepClone(props.image);
}, {
	deep: true,
});

watch(reactiveImage, () => {
	if (defaultStore.state.nsfw === 'force' || defaultStore.state.dataSaver.media) {
		hide.value = true;
	} else if (defaultStore.state.nsfw === 'ignore') {
		hide.value = false;
	} else {
		hide.value = reactiveImage.value.isSensitive;
	}
	if (defaultStore.state.highlightSensitiveMedia) {
		sensitive.value = reactiveImage.value.isSensitive;
	} else {
		sensitive.value = false;
	}
}, {
	deep: true,
	immediate: true,
});

const reactiveColor = computed(() => {
	return (
		defaultStore.reactiveState.darkMode.value
			? 'rgba(255, 255, 255, 0.02)'
			: 'rgba(0, 0, 0, 0.02)'
	);
});

const onClick = (): void => {
	if (!props.controls || !hide.value) return;
	hide.value = false;
};

const showMenu = (ev: MouseEvent): void => {
	os.popupMenu(getMenu(), ev.currentTarget ?? ev.target);
};

const getMenu = (): MenuItem[] => {
	const menu: MenuItem[] = [];
	menu.push({
		text: i18n.ts.hide,
		icon: 'ti ti-eye-off',
		action: () => {
			hide.value = true;
		},
	});
	if (!mock && iAmOwner.value) {
		menu.push({ type: 'divider' });
		menu.push({
			type: 'link',
			to: `/my/drive/file/${reactiveImage.value.id}`,
			text: i18n.ts._fileViewer.title,
			icon: 'ti ti-info-circle',
		});
	}
	if (!mock && iAmModerator) {
		menu.push({ type: 'divider' });
		menu.push({
			type: 'label',
			text: i18n.ts.moderation,
		});
		menu.push({
			type: 'link',
			to: `/admin/file/${reactiveImage.value.id}`,
			text: i18n.ts._fileViewer.title,
			icon: 'ti ti-info-circle',
		});
		menu.push({
			text: reactiveImage.value.isSensitive ? i18n.ts.unmarkAsSensitive : i18n.ts.markAsSensitive,
			icon: reactiveImage.value.isSensitive ? 'ti ti-eye' : 'ti ti-eye-exclamation',
			danger: true,
			action: () => {
				os.apiWithDialog('drive/files/update', {
					fileId: reactiveImage.value.id,
					isSensitive: !reactiveImage.value.isSensitive,
				}).then(({ isSensitive }) => {
					reactiveImage.value.isSensitive = isSensitive;
				});
			},
		});
	}
	return menu;
};
</script>

<style lang="scss" module>
.cqRoot {
	container: mkmediaimage / inline-size;
}

.root {
	--scale: 1;
	position: relative;
	width: 100%;
	height: 100%;
	min-height: calc(80px * var(--scale));
}

.sensitive {
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

.visible {
	background: var(--bg);
	background-image: linear-gradient(
		45deg,
		v-bind(reactiveColor) 16.67%,
		var(--bg) 16.67%,
		var(--bg) 50%,
		v-bind(reactiveColor) 50%,
		v-bind(reactiveColor) 66.67%,
		var(--bg) 66.67%,
		var(--bg) 100%
	);
	background-size: 16px 16px;
}

.hiddenTextWrapper {
	display: table-cell;
	text-align: center;
	font-size: 0.8em;
	color: #fff;
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

.imageContainer {
	display: block;
	overflow: hidden;
	width: 100%;
	height: 100%;
	background-position: center;
	background-size: contain;
	background-repeat: no-repeat;
}

%Controls {
	position: absolute;
	inset: auto;
	display: flex;

	&:empty {
		display: none;
	}
}

%ControlItem {
	text-align: center;
	font-size: clamp(6px, calc(12px * var(--scale)), 12px);
	padding:
		clamp(3px, calc(6px * var(--scale)), 6px)
		clamp(2px, calc(4px * var(--scale)), 4px);

	&:first-child {
		padding-left: clamp(4px, calc(8px * var(--scale)), 8px);
	}

	&:last-child {
		padding-right: clamp(4px, calc(8px * var(--scale)), 8px);
	}
}

.controlsUpperRight {
	@extend %Controls;
	top: 0;
	right: 0;

	> .controlItem {
		@extend %ControlItem;
		padding-bottom: 0;

		&:first-child {
			padding-left: 0;
		}
	}
}

.controlsLowerRight {
	@extend %Controls;
	right: 0;
	bottom: 0;

	> .controlItem {
		@extend %ControlItem;
		padding-top: 0;

		&:first-child {
			padding-left: 0;
		}
	}
}

.controlsLowerLeft {
	@extend %Controls;
	bottom: 0;
	left: 0;

	> .controlItem {
		@extend %ControlItem;
		padding-top: 0;

		&:last-child {
			padding-right: 0;
		}
	}
}

.controlsUpperLeft {
	@extend %Controls;
	top: 0;
	left: 0;

	> .controlItem {
		@extend %ControlItem;
		padding-bottom: 0;

		&:last-child {
			padding-right: 0;
		}
	}
}

.controlButton {
	display: block;
	border-radius: clamp(3px, calc(6px * var(--scale)), 6px);
	padding:
		clamp(3px, calc(6px * var(--scale)), 6px)
		clamp(4px, calc(8px * var(--scale)), 8px);
	background-color: rgba(0, 0, 0, 0.5);
	color: #fff;
	transition: background-color 0.1s ease;

	&:hover {
		background-color: rgba(0, 0, 0, 0.7);
	}
}

@container mkmediaimage (max-width: 300px) {
	.root {
		--scale: 0.85;
	}
}

@container mkmediaimage (max-width: 250px) {
	.root {
		--scale: 0.80;
	}

	.controlsLowerLeft {
		display: none;
	}

	.controlsUpperLeft {
		display: none;
	}
}

@container mkmediaimage (max-width: 200px) {
	.root {
		--scale: 0.75;
	}
}

@container mkmediaimage (max-width: 150px) {
	.root {
		--scale: 0.70;
		min-height: auto;
	}

	.controlsUpperRight {
		display: none;
	}
}
</style>
