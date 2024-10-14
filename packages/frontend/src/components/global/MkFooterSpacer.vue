<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.spacer"></div>
</template>

<style lang="scss" module>
.spacer {
	box-sizing: border-box;
	padding: 32px;
	margin: 0 auto;
	height: 300px;
	background-clip: content-box;
	background-image: repeating-linear-gradient(
		135deg,
		transparent 0px 10px,
		var(--c) 6px 16px
	);

	// NOTE: iOS/iPadOS環境でクラッシュする https://github.com/taiyme/misskey/issues/293
	html[data-browser-engine=webkit] & {
		background-image: unset !important;
	}

	&,
	html[data-color-scheme=light] & {
		--c: rgb(0 0 0 / 0.02);
	}

	html[data-color-scheme=dark] & {
		--c: rgb(255 255 255 / 0.02);
	}
}
</style>
