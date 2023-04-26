import { Note } from 'misskey-js/built/entities';

type SomeRequired<T, K extends keyof T> = Omit<T, K> & Required<RequiredNotNull<Pick<T, K>>>;
type RequiredNotNull<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export const isPureRenote = (note: Note): note is SomeRequired<Note, 'renote' | 'renoteId'> => {
	return (
		note.renote != null &&
		note.text == null &&
		note.fileIds.length === 0 &&
		note.poll == null
	);
};
