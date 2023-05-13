import { api } from '@/os';

type CustomImageResponse = {
	infoImageURL: string;
	notFoundImageURL: string;
	errorImageURL: string;
	pwaIcon192URL: string;
	pwaIcon512URL: string;
};

export default class CustomImage {
	private static _infoImageURL = '';
	private static _notFoundImageURL = '';
	private static _errorImageURL = '';

	private static fetchCustomImage(): Promise<CustomImageResponse> {
		return api('tms/custom-image/get', {});
	}

	public static get infoImageURL(): string {
		if (!this._infoImageURL) {
			this.fetchCustomImage().then((res) => this._infoImageURL = res.infoImageURL).catch(() => this._infoImageURL = '');
		}

		return this._infoImageURL;
	}

	public static get notFoundImageURL(): string {
		if (!this._notFoundImageURL) {
			this.fetchCustomImage().then((res) => this._notFoundImageURL = res.notFoundImageURL).catch(() => this._notFoundImageURL = '');
		}

		return this._notFoundImageURL;
	}

	public static get errorImageURL(): string {
		if (!this._errorImageURL) {
			this.fetchCustomImage().then((res) => this._errorImageURL = res.errorImageURL).catch(() => this._errorImageURL = '');
		}

		return this._errorImageURL;
	}
}
