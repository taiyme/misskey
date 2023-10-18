/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-FileCopyrightText: Copyright © 2023 taiy https://github.com/taiyme
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// const aidRegExp = /^[0-9a-z]{10}$/;
// const aidxRegExp = /^[0-9a-z]{16}$/;
// const meidRegExp = /^[0-9a-f]{24}$/;
// const meidgRegExp = /^g[0-9a-f]{23}$/;
// const objectIdRegExp = /^[0-9a-f]{24}$/;
// const ulidRegExp = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

// // 最初の1字だけ見る
// type Num = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
// type AF = 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
// type AZ = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
// type AZUpper = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
// type MisskeyAid = `${Num | AZ}${string}`;
// type MisskeyAidx = `${Num | AZ}${string}`;
// type MisskeyMeid = `${Num | AF}${string}`;
// type MisskeyMeidg = `g${Num | AF}${string}`;
// type MisskeyObjectId = `${Num | AF}${string}`;
// type MisskeyUlid = `${Num | Exclude<AZUpper, 'I' | 'L' | 'O' | 'U'>}${string}`;

// type MisskeyId = MisskeyAid | MisskeyMeid | MisskeyMeidg | MisskeyObjectId;

// const isMisskeyAid = (id: string): id is MisskeyAid => aidRegExp.test(id);
// const isMisskeyAidx = (id: string): id is MisskeyAidx => aidxRegExp.test(id);
// const isMisskeyMeid = (id: string): id is MisskeyMeid => meidRegExp.test(id);
// const isMisskeyMeidg = (id: string): id is MisskeyMeidg => meidgRegExp.test(id);
// const isMisskeyObjectId = (id: string): id is MisskeyObjectId => objectIdRegExp.test(id);
// const isMisskeyUlid = (id: string): id is MisskeyUlid => ulidRegExp.test(id);

// export const checkMisskeyId = (id: string): id is MisskeyId => {
// 	return isMisskeyAid(id) || isMisskeyAidx(id) || isMisskeyMeid(id) || isMisskeyMeidg(id) || isMisskeyObjectId(id) || isMisskeyUlid(id);
// };

export const checkMisskeyId = (id: string): boolean => {
	const len = id.length;
	if (len === 10 || len === 16 || len === 24 || len === 26) {
		return /^[A-Za-z0-9]+$/.test(id);
	}
	return false;
};
