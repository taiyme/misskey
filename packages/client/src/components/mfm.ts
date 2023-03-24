import { VNode, defineComponent, h, PropType } from 'vue';
import { CustomEmoji } from 'misskey-js/built/entities';
import * as mfm from 'mfm-js';
import MkUrl from '@/components/global/MkUrl.vue';
import MkLink from '@/components/MkLink.vue';
import MkMention from '@/components/MkMention.vue';
import MkEmoji from '@/components/global/MkEmoji.vue';
import MkFormula from '@/components/MkFormula.vue';
import MkCode from '@/components/MkCode.vue';
import MkGoogle from '@/components/MkGoogle.vue';
import MkSparkle from '@/components/MkSparkle.vue';
import MkA from '@/components/global/MkA.vue';
import { host } from '@/config';
import { defaultStore } from '@/store';
import { parseMfmText } from '@/scripts/tms/parse-mfm-text';

export default defineComponent({
	props: {
		text: {
			type: String,
			required: true,
		},
		plain: {
			type: Boolean,
			default: false,
		},
		nowrap: {
			type: Boolean,
			default: false,
		},
		author: {
			type: Object,
			default: null,
		},
		i: {
			type: Object,
			default: null,
		},
		customEmojis: {
			type: Array as PropType<CustomEmoji[]>,
			required: false,
			default: undefined,
		},
		isNote: {
			type: Boolean,
			default: true,
		},
	},

	render() {
		if (this.text == null || this.text === '') return;

		const ast = (this.plain ? mfm.parseSimple : mfm.parse)(this.text);

		const validTime = (t: unknown): string | null => {
			if (typeof t !== 'string') return null;
			return t.match(/^[0-9.]+s$/) ? t : null;
		};

		const parseNumber = (n: unknown): number | null => {
			if (typeof n === 'number') return n;
			if (typeof n !== 'string') return null;
			const parsedFloat = parseFloat(n);
			if (Number.isNaN(parsedFloat)) return null;
			return parsedFloat;
		};

		const validHex = (hex: unknown): hex is string => {
			if (typeof hex !== 'string') return false;
			// TODO: v13系との互換性のためにあえて残しているが、このままでは4桁,5桁の意図しない色コードを許可してしまう
			// 6桁,3桁の色コードを許可するつもりなら /^([0-9a-f]{3}){1,2}$/i
			// 加えて8桁,4桁の色コードを許可するのであれば /^(([0-9a-f]{3}){1,2}|([0-9a-f]{4}){1,2})$/i
			return /^[0-9a-f]{3,6}$/i.test(hex);
		};

		const useAnim = defaultStore.state.animatedMfm;

		const genEl = (ast: mfm.MfmNode[], parents: string[]) => ast.map((token): VNode | string | (VNode | string)[] => {
			switch (token.type) {
				case 'text': {
					const text = token.props.text.replace(/(\r\n|\n|\r)/g, '\n');

					if (!this.plain) {
						const res: (VNode | string)[] = [];
						for (const t of text.split('\n')) {
							res.push(h('br'));
							res.push(...parseMfmText(t, parents));
						}
						res.shift();
						return res;
					} else {
						return [text.replace(/\n/g, ' ')];
					}
				}

				case 'bold': {
					return [h('b', genEl(token.children, [...parents, token.type]))];
				}

				case 'strike': {
					return [h('del', genEl(token.children, [...parents, token.type]))];
				}

				case 'italic': {
					return h('i', {
						style: 'font-style: oblique;',
					}, genEl(token.children, [...parents, token.type]));
				}

				case 'fn': {
					// TODO: CSSを文字列で組み立てていくと token.props.args.~~~ 経由でCSSインジェクションできるのでよしなにやる
					let style: string | undefined;
					switch (token.props.name) {
						case 'tada': {
							const speed = validTime(token.props.args.speed) ?? '1s';
							style = 'font-size: 150%;' + (useAnim ? `animation: tada ${speed} linear infinite both;` : '');
							break;
						}
						case 'jelly': {
							const speed = validTime(token.props.args.speed) ?? '1s';
							style = (useAnim ? `animation: mfm-rubberBand ${speed} linear infinite both;` : '');
							break;
						}
						case 'twitch': {
							const speed = validTime(token.props.args.speed) ?? '0.5s';
							style = useAnim ? `animation: mfm-twitch ${speed} ease infinite;` : '';
							break;
						}
						case 'shake': {
							const speed = validTime(token.props.args.speed) ?? '0.5s';
							style = useAnim ? `animation: mfm-shake ${speed} ease infinite;` : '';
							break;
						}
						case 'spin': {
							const direction =
								token.props.args.left ? 'reverse' :
								token.props.args.alternate ? 'alternate' :
								'normal';
							const anime =
								token.props.args.x ? 'mfm-spinX' :
								token.props.args.y ? 'mfm-spinY' :
								'mfm-spin';
							const speed = validTime(token.props.args.speed) ?? '1.5s';
							style = useAnim ? `animation: ${anime} ${speed} linear infinite; animation-direction: ${direction};` : '';
							break;
						}
						case 'jump': {
							const speed = validTime(token.props.args.speed) ?? '0.75s';
							style = useAnim ? `animation: mfm-jump ${speed} linear infinite;` : '';
							break;
						}
						case 'bounce': {
							const speed = validTime(token.props.args.speed) ?? '0.75s';
							style = useAnim ? `animation: mfm-bounce ${speed} linear infinite; transform-origin: center bottom;` : '';
							break;
						}
						case 'flip': {
							const transform =
								(token.props.args.h && token.props.args.v) ? 'scale(-1, -1)' :
								token.props.args.v ? 'scaleY(-1)' :
								'scaleX(-1)';
							style = `transform: ${transform};`;
							break;
						}
						case 'x2': {
							return h('span', {
								class: 'mfm-x2',
							}, genEl(token.children, [...parents, `${token.type}:${token.props.name}`]));
						}
						case 'x3': {
							return h('span', {
								class: 'mfm-x3',
							}, genEl(token.children, [...parents, `${token.type}:${token.props.name}`]));
						}
						case 'x4': {
							return h('span', {
								class: 'mfm-x4',
							}, genEl(token.children, [...parents, `${token.type}:${token.props.name}`]));
						}
						case 'font': {
							const family =
								token.props.args.serif ? 'serif' :
								token.props.args.monospace ? 'monospace' :
								token.props.args.cursive ? 'cursive' :
								token.props.args.fantasy ? 'fantasy' :
								token.props.args.emoji ? 'emoji' :
								token.props.args.math ? 'math' :
								null;
							if (family) {
								return h('span', {
									class: `mfm-ff-${family}`,
								}, genEl(token.children, [...parents, `${token.type}:${token.props.name}`]));
							}
							break;
						}
						case 'blur': {
							return h('span', {
								class: '_mfm_blur_',
							}, genEl(token.children, [...parents, `${token.type}:${token.props.name}`]));
						}
						case 'rainbow': {
							const speed = validTime(token.props.args.speed) ?? '1s';
							style = useAnim ? `animation: mfm-rainbow ${speed} linear infinite;` : '';
							break;
						}
						case 'sparkle': {
							if (!useAnim) {
								return genEl(token.children, [...parents, `${token.type}:${token.props.name}`]);
							}
							return h(MkSparkle, {}, genEl(token.children, [...parents, `${token.type}:${token.props.name}`]));
						}
						case 'rotate': {
							const degrees = parseNumber(token.props.args.deg) ?? 90;
							style = `transform: rotate(${degrees}deg); transform-origin: center center;`;
							break;
						}
						case 'position': {
							const x = parseNumber(token.props.args.x) ?? 0;
							const y = parseNumber(token.props.args.y) ?? 0;
							style = `transform: translateX(${x}em) translateY(${y}em);`;
							break;
						}
						case 'scale': {
							const x = Math.min(parseNumber(token.props.args.x) ?? 1, 5);
							const y = Math.min(parseNumber(token.props.args.y) ?? 1, 5);
							style = `transform: scale(${x}, ${y});`;
							break;
						}
						case 'fg': {
							let color = token.props.args.color;
							if (!validHex(color)) color = 'f00';
							style = `color: #${color};`;
							break;
						}
						case 'bg': {
							let color = token.props.args.color;
							if (!validHex(color)) color = 'f00';
							style = `background-color: #${color};`;
							break;
						}
					}
					if (style == null) {
						return h('span', {}, ['$[', token.props.name, ' ', ...genEl(token.children, [...parents, `${token.type}:${token.props.name}`]), ']']);
					} else {
						return h('span', {
							style: 'display: inline-block; ' + style,
						}, genEl(token.children, [...parents, `${token.type}:${token.props.name}`]));
					}
				}

				case 'small': {
					return [h('small', {
						style: 'opacity: 0.7;',
					}, genEl(token.children, [...parents, token.type]))];
				}

				case 'center': {
					return [h('div', {
						style: 'text-align:center;',
					}, genEl(token.children, [...parents, token.type]))];
				}

				case 'url': {
					return [h(MkUrl, {
						key: Math.random(),
						url: token.props.url,
						rel: 'nofollow noopener',
					})];
				}

				case 'link': {
					return [h(MkLink, {
						key: Math.random(),
						url: token.props.url,
						rel: 'nofollow noopener',
					}, genEl(token.children, [...parents, token.type]))];
				}

				case 'mention': {
					return [h(MkMention, {
						key: Math.random(),
						host: (token.props.host == null && this.author && this.author.host != null ? this.author.host : token.props.host) || host,
						username: token.props.username,
					})];
				}

				case 'hashtag': {
					return [h(MkA, {
						key: Math.random(),
						to: this.isNote ? `/tags/${encodeURIComponent(token.props.hashtag)}` : `/explore/tags/${encodeURIComponent(token.props.hashtag)}`,
						style: 'color:var(--hashtag);',
					}, `#${token.props.hashtag}`)];
				}

				case 'blockCode': {
					return [h(MkCode, {
						key: Math.random(),
						code: token.props.code,
						lang: token.props.lang ?? undefined,
					})];
				}

				case 'inlineCode': {
					return [h(MkCode, {
						key: Math.random(),
						code: token.props.code,
						inline: true,
					})];
				}

				case 'quote': {
					if (!this.nowrap) {
						return [h('div', {
							class: 'quote',
						}, genEl(token.children, [...parents, token.type]))];
					} else {
						return [h('span', {
							class: 'quote',
						}, genEl(token.children, [...parents, token.type]))];
					}
				}

				case 'emojiCode': {
					return [h(MkEmoji, {
						key: Math.random(),
						emoji: `:${token.props.name}:`,
						customEmojis: this.customEmojis,
						normal: this.plain,
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						host: this.author?.host,
					})];
				}

				case 'unicodeEmoji': {
					return [h(MkEmoji, {
						key: Math.random(),
						emoji: token.props.emoji,
						customEmojis: this.customEmojis,
						normal: this.plain,
					})];
				}

				case 'mathInline': {
					return [h(MkFormula, {
						key: Math.random(),
						formula: token.props.formula,
						block: false,
					})];
				}

				case 'mathBlock': {
					return [h(MkFormula, {
						key: Math.random(),
						formula: token.props.formula,
						block: true,
					})];
				}

				case 'search': {
					return [h(MkGoogle, {
						key: Math.random(),
						q: token.props.query,
					})];
				}

				case 'plain': {
					return [h('span', genEl(token.children, [...parents, token.type]))];
				}

				default: {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					console.error('unrecognized ast type:', (token as any).type);

					return [];
				}
			}
		}).flat(Infinity) as (VNode | string)[];

		// Parse ast to DOM
		return h('span', genEl(ast, []));
	},
});
