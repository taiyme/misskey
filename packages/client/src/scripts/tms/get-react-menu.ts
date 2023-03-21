import { defineAsyncComponent, Ref } from 'vue';
import { Note } from 'misskey-js/built/entities';
import * as os from '@/os';
import { i18n } from '@/i18n';
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import { copyText } from '@/scripts/tms/clipboard';
import { getEmojiName } from '@/scripts/emojilist';
import { MenuItem } from '@/types/menu';

type ReactProps = {
	reaction: string;
	note: Note;
	canToggle: Ref<boolean>;
	reactButton: Ref<HTMLElement | undefined>;
};

const createReaction = ({ noteId, reaction }: { noteId: string, reaction: string }): Promise<null> => {
	return os.api('notes/reactions/create', { noteId, reaction });
};

const deleteReaction = ({ noteId }: { noteId: string }): Promise<null> => {
	return os.api('notes/reactions/delete', { noteId });
};

const getReactionName = (reaction: string): string => {
	const trimLocal = reaction.replace('@.', '');
	if (trimLocal.startsWith(':')) {
		return trimLocal;
	}
	return getEmojiName(reaction) ?? reaction;
};

const showReactions = ({ noteId, initialTab }: {
	noteId: string;
	initialTab?: string | null;
}): void => {
	os.popup(defineAsyncComponent(() => import('@/components/MkReactedUsersDialog.vue')), { noteId, initialTab }, {}, 'closed');
};

const rippleEffect = (el: HTMLElement | null | undefined): void => {
	if (!el) return;
	const rect = el.getBoundingClientRect();
	const x = rect.left + (el.offsetWidth / 2);
	const y = rect.top + (el.offsetHeight / 2);
	os.popup(MkRippleEffect, { x, y }, {}, 'end');
};

export const getReactMenu = ({ reaction, note, canToggle, reactButton }: ReactProps): void => {
	if (!reactButton.value) return;

	const noteId = note.id;
	const reactionName = getReactionName(reaction);

	const menu: MenuItem[] = [];

	menu.push({
		type: 'label',
		text: reactionName,
	});

	if (canToggle.value) {
		if (note.myReaction !== reaction) {
			menu.push({
				text: i18n.ts._tms.react,
				icon: 'ti ti-plus',
				action: (): void => {
					rippleEffect(reactButton.value);

					if (note.myReaction) {
						deleteReaction({ noteId }).then(() => createReaction({ noteId, reaction }));
					} else {
						createReaction({ noteId, reaction });
					}
				},
			});
		} else {
			menu.push({
				text: i18n.ts._tms.unreact,
				icon: 'ti ti-minus',
				action: (): void => {
					rippleEffect(reactButton.value);

					if (note.myReaction) {
						deleteReaction({ noteId });
					}
				},
			});
		}
	}

	menu.push({
		text: i18n.ts.copy,
		icon: 'ti ti-copy',
		action: (): void => {
			copyText(reaction.startsWith(':') ? reactionName : reaction);
			os.success();
		},
	});

	menu.push({
		text: i18n.ts.details,
		icon: 'ti ti-info-circle',
		action: (): void => {
			showReactions({
				noteId,
				initialTab: reaction,
			});
		},
	});

	os.popupMenu(menu, reactButton.value);
};

export const toggleReact = ({ reaction, note, canToggle, reactButton }: ReactProps): void => {
	if (!canToggle.value) return;
	if (!reactButton.value) return;

	const noteId = note.id;
	const oldReaction = note.myReaction;

	rippleEffect(reactButton.value);

	if (oldReaction) {
		deleteReaction({ noteId }).then(() => {
			if (oldReaction !== reaction) {
				createReaction({ noteId, reaction });
			}
		});
	} else {
		createReaction({ noteId, reaction });
	}
};

export const getReactMenuDryrun = ({ reactButton }: Pick<ReactProps, 'reactButton'>): void => {
	if (reactButton.value) return;

	const menu: MenuItem[] = [];

	menu.push({
		type: 'label',
		text: '+1',
	});

	menu.push({
		text: i18n.ts._tms.react,
		icon: 'ti ti-plus',
		action: (): void => rippleEffect(reactButton.value),
	});

	menu.push({
		text: i18n.ts.copy,
		icon: 'ti ti-copy',
		action: (): void => {},
	});

	menu.push({
		text: i18n.ts.details,
		icon: 'ti ti-info-circle',
		action: (): void => {},
	});

	os.popupMenu(menu, reactButton.value);
};

export const toggleReactDryrun = ({ reactButton }: Pick<ReactProps, 'reactButton'>): void => {
	if (reactButton.value) return;
	rippleEffect(reactButton.value);
};
