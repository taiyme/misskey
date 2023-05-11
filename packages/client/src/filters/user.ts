import * as Misskey from 'misskey-js';
import * as Acct from 'misskey-js/built/acct';
import { url } from '@/config';

export const acct = (user: Misskey.Acct) => {
	return Acct.toString(user);
};

export const userName = (user: Misskey.entities.User) => {
	return user.name || user.username;
};

export const userPage = (user: Misskey.Acct, path?, absolute = false) => {
	return `${absolute ? url : ''}/@${acct(user)}${(path ? `/${path}` : '')}`;
};
