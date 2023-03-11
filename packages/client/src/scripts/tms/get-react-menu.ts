import { defineAsyncComponent, Ref } from 'vue';
import * as misskey from 'misskey-js';
import * as os from '@/os';
import { i18n } from '@/i18n';
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import copyToClipboard from '@/scripts/copy-to-clipboard';
import { getEmojiName } from '@/scripts/emojilist';
import { MenuItem } from '@/types/menu';

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

export const getReactMenu = ({
	reaction,
	note,
	canToggle,
	reactButton,
}: {
	reaction: string;
	note: misskey.entities.Note;
	canToggle: Ref<boolean>;
	reactButton: Ref<HTMLElement | undefined>;
}): void => {
	if (!reactButton.value) return;

	const reactionName = getReactionName(reaction);

	const menu: MenuItem[] = [];

	menu.push({
		type: 'label',
		text: reactionName,
	});

	if (canToggle.value) {
		const noteId = note.id;

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
			copyToClipboard(reaction.startsWith(':') ? reactionName : reaction);
			os.success();
		},
	});

	menu.push({
		text: i18n.ts.details,
		icon: 'ti ti-info-circle',
		action: (): void => {
			showReactions({
				noteId: note.id,
				initialTab: reaction,
			});
		},
	});

	os.popupMenu(menu, reactButton.value);
};
