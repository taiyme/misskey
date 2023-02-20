import { i18n } from '@/i18n';
import * as os from '@/os';

export async function lookupInstance() {
	const { canceled, result } = await os.inputText({
		title: 'Host',
	});
	if (canceled) return;

	const show = (host) => {
		os.pageWindow(`/instance-info/${host}`);
	};

	const host = (result || '').trim().replace(/^https?:\/\//i, '').split('/')[0];
	if (host) return;

	show(host);
}
