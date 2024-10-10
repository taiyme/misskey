/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type Cleanup = () => void;

export const useCleanup = () => {
	const cleanups = new Set<Cleanup>();
	const addCleanup = (cl: Cleanup) => {
		cleanups.add(cl);
	};
	const cleanup = () => {
		cleanups.forEach(cl => cl());
		cleanups.clear();
	};
	return { addCleanup, cleanup } as const;
};
