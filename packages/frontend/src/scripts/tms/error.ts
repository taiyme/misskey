/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class TmsError extends Error {
	public readonly message: string;
	public readonly code: string;
	public readonly id: string;
	public readonly kind: string;

	constructor(error: {
		readonly message: string;
		readonly code: string;
		readonly id: string;
		readonly kind?: string | null;
	}) {
		const kind = error.kind == null ? 'tms' : `tms/${error.kind}`;
		const message = `${error.message} (kind: ${kind})`;

		super(message);

		this.message = message;
		this.code = error.code;
		this.id = error.id;
		this.kind = kind;
	}
}

export const parseErrorMessage = (error: unknown): string => {
	if (error instanceof TmsError) {
		return `${error.message}\n${error.code}\n${error.id}`;
	}
	if (typeof error === 'object' && error != null && 'message' in error && typeof error.message === 'string') {
		return `${error.message}\n${(error as any).id}`;
	}
	if (typeof error === 'string' && error !== '') {
		return error;
	}
	return 'Unknown error.';
};
