<template>
<div v-if="user" :class="[$style.root, { [$style.showActionsOnlyOnHover]: showActionsOnlyOnHover }]">
	<article :class="$style.article">
		<MkAvatar :class="$style.avatar" :user="user" disable-link disable-preview/>
		<div :class="$style.main">
			<header :class="$style.header">
				<div :class="$style.name"><MkUserName :user="user"/></div>
				<div :class="$style.username"><MkAcct :user="user"/></div>
				<div :class="$style.info"><div><MkTime :time="createdAt"/></div></div>
			</header>
			<MkInstanceTicker :force-type="instanceTickerPosition"/>
			<div>
				<div :class="$style.content">
					<div :class="$style.text"><Mfm :text="text" :author="user" :i="$i"/></div>
				</div>
			</div>
			<div :class="$style.reactionsViewer">
				<button
					ref="reactButton"
					:class="$style.reactionButton"
					class="_button"
					@click="react"
				>
					<MkEmoji emoji="👍" :custom-emojis="[]" :is-reaction="true" :normal="true"/>
					<span :class="$style.reactionCount">1</span>
				</button>
			</div>
			<footer :class="$style.footer">
				<button :class="$style.footerButton" class="_button"><i class="ti ti-arrow-back-up"></i></button>
				<button :class="$style.footerButton" class="_button"><i class="ti ti-repeat"></i></button>
				<button :class="$style.footerButton" class="_button"><i class="ti ti-plus"></i></button>
				<button :class="$style.footerButton" class="_button"><i class="ti ti-dots"></i></button>
				<div v-if="showActionsOnlyOnHover" :class="$style.footerButton" class="_button"><i class="ti ti-info-circle"></i></div>
			</footer>
		</div>
	</article>
</div>
</template>

<script lang="ts" setup>
import { ref, computed, ComputedRef } from 'vue';
import MkInstanceTicker from '@/components/MkInstanceTicker.vue';
import { $i } from '@/account';
import { isTouchUsing } from '@/scripts/touch';
import { deviceKind } from '@/scripts/device-kind';
import { tmsStore } from '@/tms/store';
import { getReactMenuDryrun, toggleReactDryrun } from '@/scripts/tms/get-react-menu';

const props = withDefaults(defineProps<{
	text?: string;
	instanceTickerPosition?: typeof tmsStore.state.instanceTickerPosition | ComputedRef<typeof tmsStore.state.instanceTickerPosition>;
	useReactionMenu?: typeof tmsStore.state.useReactionMenu | ComputedRef<typeof tmsStore.state.useReactionMenu>;
	showActionsOnlyOnHover?: typeof tmsStore.state.showActionsOnlyOnHover | ComputedRef<typeof tmsStore.state.showActionsOnlyOnHover>;
}>(), {
	text: 'Oh my Aichan',
	instanceTickerPosition: tmsStore.state.instanceTickerPosition,
	useReactionMenu: tmsStore.state.useReactionMenu,
	showActionsOnlyOnHover: tmsStore.state.showActionsOnlyOnHover,
});

const user = ref($i);
const createdAt = ref(new Date().toJSON());
const reactButton = ref<HTMLElement>();

const useReactionMenu = computed(() => {
	return (
		typeof props.useReactionMenu === 'boolean'
			? props.useReactionMenu
			: props.useReactionMenu.value
	);
});

const showActionsOnlyOnHover = computed(() => {
	return (
		typeof props.showActionsOnlyOnHover === 'boolean'
			? props.showActionsOnlyOnHover
			: props.showActionsOnlyOnHover.value
	) && !isTouchUsing && deviceKind !== 'smartphone';
});

const react = (): void => {
	if (useReactionMenu.value) {
		getReactMenuDryrun({ reactButton });
	} else {
		toggleReactDryrun({ reactButton });
	}
};
</script>

<style lang="scss" module>
.root {
	container-type: inline-size;
	position: relative;
	transition: box-shadow 0.1s ease;
	font-size: 1.05em;
	overflow: clip;
	contain: content;
	background: var(--panel);

	&.showActionsOnlyOnHover {
		.footer {
			visibility: hidden;
			position: absolute;
			top: 12px;
			right: 12px;
			padding: 0 4px;
			margin-bottom: 0 !important;
			background: var(--popup);
			border-radius: 8px;
			box-shadow: 0px 4px 32px var(--shadow);
		}

		.footerButton {
			font-size: 90%;

			&:not(:last-child) {
				margin-right: 0;
			}
		}
	}

	&.showActionsOnlyOnHover:hover {
		.footer {
			visibility: visible;
		}
	}
}

.article {
	display: flex;
	padding: 28px 32px 18px;
}

.avatar {
	flex-shrink: 0;
	display: block;
	margin: 0 14px 8px 0;
	width: 58px;
	height: 58px;
	position: relative;
	top: 0;
	left: 0;
}

.main {
	flex: 1;
	min-width: 0;
}

.header {
	display: flex;
	align-items: baseline;
	white-space: nowrap;
}

.name {
	flex-shrink: 1;
	display: block;
	margin: 0 .5em 0 0;
	padding: 0;
	overflow: hidden;
	font-size: 1em;
	font-weight: bold;
	text-decoration: none;
	text-overflow: ellipsis;

	&:hover {
		text-decoration: underline;
	}
}

.username {
	flex-shrink: 9999999;
	margin: 0 .5em 0 0;
	overflow: hidden;
	text-overflow: ellipsis;
}

.info {
	flex-shrink: 0;
	margin-left: auto;
	font-size: 0.9em;
}

.text {
	overflow-wrap: break-word;
}

.footerButton {
	margin: 0;
	padding: 8px;

	&:not(:last-child) {
		margin-right: 28px;
	}

	&:hover {
		color: var(--fgHighlighted);
	}
}

.reactionsViewer {
	margin: 4px -2px 0 -2px;
}

.reactionButton {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
	border-radius: 4px;
	background: rgba(0, 0, 0, 0.05);

	&:hover {
		background: rgba(0, 0, 0, 0.1);
	}
}

.reactionCount {
	font-size: 0.9em;
	line-height: 32px;
	margin: 0 0 0 4px;
}

@container (max-width: 580px) {
	.root {
		font-size: 0.95em;
	}

	.article {
		padding: 24px 26px;
	}

	.avatar {
		width: 50px;
		height: 50px;
	}
}

@container (max-width: 500px) {
	.root {
		font-size: 0.9em;
	}

	.article {
		padding: 20px 22px;
	}

	.footer {
		margin-bottom: -8px;
	}
}

@container (max-width: 480px) {

	.article {
		padding: 14px 16px;
	}
}

@container (max-width: 450px) {
	.avatar {
		margin: 0 10px 0 0;
		width: 46px;
		height: 46px;
	}
}

@container (max-width: 400px) {
	.footerButton {
			&:not(:last-child) {
				margin-right: 18px;
			}
		}
}

@container (max-width: 350px) {
	.footerButton {
		&:not(:last-child) {
			margin-right: 12px;
		}
	}
}

@container (max-width: 300px) {
	.avatar {
		width: 44px;
		height: 44px;
	}

	.footerButton {
		&:not(:last-child) {
			margin-right: 8px;
		}
	}
}
</style>
