/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Directive, defineAsyncComponent, ref } from 'vue';
import type * as Misskey from 'misskey-js';
import { popup } from '@/os.js';

type Mounting = {
	preview: UserPreview;
};

const mountings = new Map<HTMLElement, Mounting>();

export class UserPreview {
	private el: HTMLElement;
	private user: Misskey.entities.UserDetailed;
	private showTimer: number | undefined;
	private hideTimer: number | undefined;
	private checkTimer: number | undefined;
	private promise: {
		cancel: () => void;
	} | null;

	constructor(el: HTMLElement, user: Misskey.entities.UserDetailed) {
		this.el = el;
		this.user = user;
		this.promise = null;

		this.show = this.show.bind(this);
		this.close = this.close.bind(this);
		this.onMouseover = this.onMouseover.bind(this);
		this.onMouseleave = this.onMouseleave.bind(this);
		this.onClick = this.onClick.bind(this);
		this.attach = this.attach.bind(this);
		this.detach = this.detach.bind(this);

		this.attach();
	}

	private show(): void {
		if (!document.body.contains(this.el)) return;
		if (this.promise) return;

		const showing = ref(true);

		popup(defineAsyncComponent(() => import('@/components/MkUserPopup.vue')), {
			showing,
			q: this.user,
			source: this.el,
		}, {
			mouseover: () => {
				window.clearTimeout(this.hideTimer);
			},
			mouseleave: () => {
				window.clearTimeout(this.showTimer);
				this.hideTimer = window.setTimeout(this.close, 500);
			},
		}, 'closed');

		this.promise = {
			cancel: (): void => {
				showing.value = false;
			},
		};

		this.checkTimer = window.setInterval(() => {
			if (!document.body.contains(this.el)) {
				window.clearTimeout(this.showTimer);
				window.clearTimeout(this.hideTimer);
				this.close();
			}
		}, 1000);
	}

	private close(): void {
		if (this.promise) {
			window.clearInterval(this.checkTimer);
			this.promise.cancel();
			this.promise = null;
		}
	}

	private onMouseover(): void {
		window.clearTimeout(this.showTimer);
		window.clearTimeout(this.hideTimer);
		this.showTimer = window.setTimeout(this.show, 500);
	}

	private onMouseleave(): void {
		window.clearTimeout(this.showTimer);
		window.clearTimeout(this.hideTimer);
		this.hideTimer = window.setTimeout(this.close, 500);
	}

	private onClick(): void {
		window.clearTimeout(this.showTimer);
		this.close();
	}

	public attach(): void {
		this.el.addEventListener('mouseover', this.onMouseover);
		this.el.addEventListener('mouseleave', this.onMouseleave);
		this.el.addEventListener('click', this.onClick);
	}

	public detach(): void {
		this.el.removeEventListener('mouseover', this.onMouseover);
		this.el.removeEventListener('mouseleave', this.onMouseleave);
		this.el.removeEventListener('click', this.onClick);
		window.clearInterval(this.checkTimer);
	}
}

// eslint-disable-next-line import/no-default-export
export default {
	mounted(src, binding) {
		if (binding.value == null) return;

		mountings.set(src, {
			preview: new UserPreview(src, binding.value),
		});
	},

	unmounted(src, binding) {
		if (binding.value == null) return;
		const self = mountings.get(src);
		if (!self) return;
		self.preview.detach();
		mountings.delete(src);
	},
} as Directive<HTMLElement, Misskey.entities.UserDetailed | null | undefined>;
