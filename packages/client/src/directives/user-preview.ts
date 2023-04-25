import { defineAsyncComponent, Directive, ref } from 'vue';
import * as Misskey from 'misskey-js';
import autobind from 'autobind-decorator';
import { popup } from '@/os';

export class UserPreview {
	private el: HTMLElement;
	private user: Misskey.entities.User;
	private showTimer: number | undefined;
	private hideTimer: number | undefined;
	private checkTimer: number | undefined;
	private promise: {
		cancel: () => void;
	} | null;

	constructor(el: HTMLElement, user: Misskey.entities.User) {
		this.el = el;
		this.user = user;
		this.promise = null;

		this.attach();
	}

	@autobind
	private show(): void {
		if (!document.body.contains(this.el)) return;
		if (this.promise) return;

		const showing = ref(true);

		popup(defineAsyncComponent(() => import('@/components/MkUserPreview.vue')), {
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

	@autobind
	private close(): void {
		if (this.promise) {
			window.clearInterval(this.checkTimer);
			this.promise.cancel();
			this.promise = null;
		}
	}

	@autobind
	private onMouseover(): void {
		window.clearTimeout(this.showTimer);
		window.clearTimeout(this.hideTimer);
		this.showTimer = window.setTimeout(this.show, 500);
	}

	@autobind
	private onMouseleave(): void {
		window.clearTimeout(this.showTimer);
		window.clearTimeout(this.hideTimer);
		this.hideTimer = window.setTimeout(this.close, 500);
	}

	@autobind
	private onClick(): void {
		window.clearTimeout(this.showTimer);
		this.close();
	}

	@autobind
	public attach(): void {
		this.el.addEventListener('mouseover', this.onMouseover);
		this.el.addEventListener('mouseleave', this.onMouseleave);
		this.el.addEventListener('click', this.onClick);
	}

	@autobind
	public detach(): void {
		this.el.removeEventListener('mouseover', this.onMouseover);
		this.el.removeEventListener('mouseleave', this.onMouseleave);
		this.el.removeEventListener('click', this.onClick);
		window.clearInterval(this.checkTimer);
	}
}

// eslint-disable-next-line import/no-default-export
export default {
	mounted(el: HTMLElement, binding) {
		if (binding.value == null) return;

		// TODO: 新たにプロパティを作るのをやめMapを使う
		// ただメモリ的には↓の方が省メモリかもしれないので検討中
		const self = (el as any)._userPreviewDirective_ = {} as any;

		self.preview = new UserPreview(el, binding.value);
	},

	unmounted(el, binding) {
		if (binding.value == null) return;

		const self = (el as any)._userPreviewDirective_;
		self.preview.detach();
	},
} as Directive<HTMLElement, Misskey.entities.User | null | undefined>;
