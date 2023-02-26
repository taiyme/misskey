import { i18n } from '@/i18n';
import * as os from '@/os';

export async function lookupNote() {
	const { canceled, result: q } = await os.inputText({
		title: 'Note ID or URL',
	});
	if (canceled) return;

	const show = (note) => {
		os.pageWindow(`/notes/${note.id}`);
	};

	if (q.startsWith('https://') || q.startsWith('http://')) {
		const promise = os.api('ap/show', {
			uri: q,
		});

		os.promiseDialog(promise, null, null, i18n.ts.fetchingAsApObject);

		const res = await promise;

		if (res.type === 'Note') {
			show(res.object);
		} else {
			os.alert({
				type: 'error',
				text: i18n.ts.notFound,
			});
		}
	} else {
		os.api('notes/show', { noteId: q }).then(show).catch(err => {
			os.alert({
				type: 'error',
				text: i18n.ts.notFound,
			});
		});
	}
}
