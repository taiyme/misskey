import { ref } from 'vue';
import { DriveFile } from 'misskey-js/built/entities';
import { v4 as uuid } from 'uuid';
import * as os from '@/os';
import { stream } from '@/stream';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';
import { uploadFile } from '@/scripts/upload';

function select(src: any, label: string | null, multiple: boolean): Promise<DriveFile | DriveFile[]> {
	return new Promise(async (res, rej) => {
		const keepOriginal = ref(defaultStore.state.keepOriginalUploading);

		const chooseFileFromPc = () => {
			const input = document.createElement('input');
			input.type = 'file';
			input.multiple = multiple;
			input.onchange = () => {
				const promises = Array.from(input.files).map(file => uploadFile(file, defaultStore.state.uploadFolder, undefined, keepOriginal.value));

				Promise.all(promises).then(driveFiles => {
					res(multiple ? driveFiles : driveFiles[0]);
				}).catch(err => {
					// アップロードのエラーは uploadFile 内でハンドリングされているためアラートダイアログを出したりはしてはいけない
				});

				// 一応廃棄
				(window as any).__misskey_input_ref__ = null;
			};

			// https://qiita.com/fukasawah/items/b9dc732d95d99551013d
			// iOS Safari で正常に動かす為のおまじない
			(window as any).__misskey_input_ref__ = input;

			input.click();
		};

		const chooseFileFromDrive = () => {
			os.selectDriveFile(multiple).then(files => {
				res(files);
			});
		};

		const chooseFileFromUrl = () => {
			os.inputText({
				title: i18n.ts.uploadFromUrl,
				type: 'url',
				placeholder: i18n.ts.uploadFromUrlDescription,
			}).then(({ canceled, result: url }) => {
				if (canceled) return;

				const marker = uuid();

				const connection = stream.useChannel('main');
				connection.on('urlUploadFinished', urlResponse => {
					if (urlResponse.marker === marker) {
						res(multiple ? [urlResponse.file] : urlResponse.file);
						connection.dispose();
					}
				});

				os.api('drive/files/upload-from-url', {
					url: url,
					folderId: defaultStore.state.uploadFolder,
					marker,
				});

				os.alert({
					title: i18n.ts.uploadFromUrlRequested,
					text: i18n.ts.uploadFromUrlMayTakeTime,
				});
			});
		};

		const { canceled } = await os.popupMenu([label ? {
			text: label,
			type: 'label',
		} : undefined, {
			type: 'switch',
			text: i18n.ts.keepOriginalUploading,
			ref: keepOriginal,
		}, {
			text: i18n.ts.upload,
			icon: 'ti ti-upload',
			action: chooseFileFromPc,
		}, {
			text: i18n.ts.fromDrive,
			icon: 'ti ti-cloud',
			action: chooseFileFromDrive,
		}, {
			text: i18n.ts.fromUrl,
			icon: 'ti ti-link',
			action: chooseFileFromUrl,
		}], src);

		if (canceled) rej();
	});
}

export function selectFile(src: any, label: string | null = null): Promise<DriveFile> {
	return select(src, label, false) as Promise<DriveFile>;
}

export function selectFiles(src: any, label: string | null = null): Promise<DriveFile[]> {
	return select(src, label, true) as Promise<DriveFile[]>;
}
