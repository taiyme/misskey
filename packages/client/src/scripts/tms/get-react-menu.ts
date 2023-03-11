import { Ref } from 'vue';
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

	const isCustomEmoji = reaction.startsWith(':');
	const emojiName = isCustomEmoji ? reaction : getEmojiName(reaction) ?? reaction;

	const menu: MenuItem[] = [];

	menu.push({
		type: 'label',
		text: emojiName,
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
			copyToClipboard(isCustomEmoji ? emojiName : reaction);
			os.success();
		},
	});

	os.popupMenu(menu, reactButton.value);
};
