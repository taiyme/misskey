<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	:class="['_button', $style.user, {
		[$style.selected]: selected,
	}]"
	@click="select()"
>
	<MkAvatar :user="user" :class="$style.avatar" indicator/>
	<div :class="$style.userBody">
		<MkUserName :user="user" :class="['_nowrap', $style.userName]"/>
		<MkAcct :user="user" :class="['_nowrap', $style.userAcct]" detail/>
	</div>
</div>
</template>

<script lang="ts" setup>
import type * as Misskey from 'misskey-js';

const props = defineProps<{
	user: Misskey.entities.UserDetailed;
	selected?: boolean;
}>();

const emit = defineEmits<{
	(ev: 'select', user: Misskey.entities.UserDetailed): void;
}>();

const select = (): void => {
	emit('select', props.user);
};
</script>

<style lang="scss" module>
.user {
	display: flex;
	gap: 8px;
	align-items: center;
	padding: 8px var(--root-margin);
	font-size: 14px;

	&:hover {
		background: var(--X7);
	}

	&.selected {
		background: var(--accent);
		color: var(--fgOnAccent);
	}
}

.userBody {
	min-width: 0;
}

.avatar {
	width: 45px;
	height: 45px;
}

.userName {
	display: block;
	font-weight: bold;
}

.userAcct {
	display: block;
	opacity: 0.5;
}
</style>
