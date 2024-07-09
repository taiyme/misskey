/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defineAsyncComponent } from 'vue';
import * as os from '@/os.js';

export type SystemWebhookEventType = 'abuseReport' | 'abuseReportResolved';

export type MkSystemWebhookEditorProps = {
	mode: 'create' | 'edit';
	id?: string;
	requiredEvents?: SystemWebhookEventType[];
};

export type MkSystemWebhookResult = {
	id?: string;
	isActive: boolean;
	name: string;
	on: SystemWebhookEventType[];
	url: string;
	secret: string;
};

export async function showSystemWebhookEditorDialog(props: MkSystemWebhookEditorProps): Promise<MkSystemWebhookResult | null> {
	const { dispose, result } = await new Promise<{
		dispose: () => void;
		result: MkSystemWebhookResult | null;
	}>(async resolve => {
		const { dispose: disposeEditor } = os.popup(
			defineAsyncComponent(() => import('@/components/MkSystemWebhookEditor.vue')),
			props,
			{
				submitted: (ev: MkSystemWebhookResult) => {
					resolve({ dispose: disposeEditor, result: ev });
				},
				closed: () => {
					resolve({ dispose: disposeEditor, result: null });
				},
			},
		);
	});

	dispose();

	return result;
}
