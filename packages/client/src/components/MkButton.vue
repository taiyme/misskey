<template>
<button
	v-if="!link"
	ref="el"
	class="bghgjjyj _button"
	:class="{ inline, primary, gradate, danger, rounded, full, small }"
	:type="type"
	@click="emit('click', $event)"
	@mousedown="onMousedown"
>
	<div ref="ripples" class="ripples"></div>
	<div class="content">
		<slot></slot>
	</div>
</button>
<MkA
	v-else
	ref="el"
	class="bghgjjyj _button"
	:class="{ inline, primary, gradate, danger, rounded, full, small }"
	:to="to"
	@mousedown="onMousedown"
>
	<div ref="ripples" class="ripples"></div>
	<div class="content">
		<slot></slot>
	</div>
</MkA>
</template>

<script lang="ts" setup>
import { nextTick, onMounted } from 'vue';

const props = defineProps<{
	inline?: boolean;
	primary?: boolean;
	gradate?: boolean;
	danger?: boolean;
	rounded?: boolean;
	full?: boolean;
	small?: boolean;
	wait?: boolean;
	autofocus?: boolean;
} & ({
	link?: false;
	type?: 'button' | 'submit' | 'reset';
} | {
	link: true;
	to: string;
})>();

const emit = defineEmits<{
	(ev: 'click', payload: MouseEvent): void;
}>();

let el = $ref<HTMLElement | null>(null);
let ripples = $ref<HTMLElement | null>(null);

onMounted(() => {
	if (props.autofocus) {
		nextTick(() => {
			el?.focus();
		});
	}
});

const distance = (p: { x: number; y: number; }, q: { x: number; y: number; }): number => {
	return Math.hypot(p.x - q.x, p.y - q.y);
};

const calcCircleScale = (boxW: number, boxH: number, circleCenterX: number, circleCenterY: number): number => {
	const origin = { x: circleCenterX, y: circleCenterY };
	const dist1 = distance({ x: 0, y: 0 }, origin);
	const dist2 = distance({ x: boxW, y: 0 }, origin);
	const dist3 = distance({ x: 0, y: boxH }, origin);
	const dist4 = distance({ x: boxW, y: boxH }, origin);
	return Math.max(dist1, dist2, dist3, dist4) * 2;
};

const onMousedown = (evt: MouseEvent): void => {
	const { target } = evt;
	if (!(target instanceof HTMLElement)) return;

	const rect = target.getBoundingClientRect();

	const ripple = document.createElement('div');
	ripple.style.top = `${evt.clientY - rect.top - 1}px`;
	ripple.style.left = `${evt.clientX - rect.left - 1}px`;

	ripples?.appendChild(ripple);

	const circleCenterX = evt.clientX - rect.left;
	const circleCenterY = evt.clientY - rect.top;

	const scale = calcCircleScale(target.clientWidth, target.clientHeight, circleCenterX, circleCenterY);

	window.setTimeout(() => {
		ripple.style.transform = `scale(${scale / 2})`;
	}, 1);
	window.setTimeout(() => {
		ripple.style.transition = 'all 1s ease';
		ripple.style.opacity = '0';
	}, 1000);
	window.setTimeout(() => {
		ripples?.removeChild(ripple);
	}, 2000);
};
</script>

<style lang="scss" scoped>
.bghgjjyj {
	position: relative;
	z-index: 1; // 他コンポーネントのbox-shadowに隠されないようにするため
	display: block;
	min-width: 100px;
	width: max-content;
	padding: 8px 16px;
	text-align: center;
	font-weight: normal;
	font-size: 90%;
	box-shadow: none;
	text-decoration: none;
	background: var(--buttonBg);
	border-radius: 5px;
	overflow: clip;
	box-sizing: border-box;
	transition: background 0.1s ease;

	&:not(:disabled):hover {
		background: var(--buttonHoverBg);
	}

	&:not(:disabled):active {
		background: var(--buttonHoverBg);
	}

	&.small {
		font-size: 90%;
		padding: 6px 12px;
	}

	&.full {
		width: 100%;
	}

	&.rounded {
		border-radius: 999px;
	}

	&.primary {
		font-weight: bold;
		color: var(--fgOnAccent) !important;
		background: var(--accent);

		&:not(:disabled):hover {
			background: var(--X8);
		}

		&:not(:disabled):active {
			background: var(--X8);
		}
	}

	&.gradate {
		font-weight: bold;
		color: var(--fgOnAccent) !important;
		background: linear-gradient(90deg, var(--buttonGradateA), var(--buttonGradateB));

		&:not(:disabled):hover {
			background: linear-gradient(90deg, var(--X8), var(--X8));
		}

		&:not(:disabled):active {
			background: linear-gradient(90deg, var(--X8), var(--X8));
		}
	}

	&.danger {
		color: #ff2a2a;

		&.primary {
			color: #fff;
			background: #ff2a2a;

			&:not(:disabled):hover {
				background: #ff4242;
			}

			&:not(:disabled):active {
				background: #d42e2e;
			}
		}
	}

	&:disabled {
		opacity: 0.7;
	}

	&:focus-visible {
		outline: solid 2px var(--focus);
		outline-offset: 2px;
	}

	&.inline {
		display: inline-block;
		width: auto;
		min-width: 100px;
	}

	> .ripples {
		position: absolute;
		z-index: 0;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 6px;
		overflow: hidden;

		::v-deep(div) {
			position: absolute;
			width: 2px;
			height: 2px;
			border-radius: 100%;
			background: rgba(0, 0, 0, 0.1);
			opacity: 1;
			transform: scale(1);
			transition: all 0.5s cubic-bezier(0,.5,0,1);
		}
	}

	&.primary > .ripples ::v-deep(div) {
		background: rgba(0, 0, 0, 0.15);
	}

	> .content {
		position: relative;
		z-index: 1;
	}
}
</style>
