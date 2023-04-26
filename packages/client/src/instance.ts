import { computed, reactive } from 'vue';
import { InstanceMetadata as InstanceMetadata_ } from 'misskey-js/built/entities';
import { api } from './os';
import { parseObject } from '@/scripts/tms/parse';

type SomeNullable<T, D extends keyof T> = { [K in keyof T]: (K extends D ? T[K] | null | undefined : T[K]) };
type InstanceMetadata = SomeNullable<InstanceMetadata_, 'emojis'>;

// TODO: 他のタブと永続化されたstateを同期

const instanceData = localStorage.getItem('instance');

// TODO: instanceをリアクティブにするかは再考の余地あり

export const instance: InstanceMetadata = reactive(
	instanceData
		? parseObject<InstanceMetadata>(instanceData)
		: {
			// TODO: set default values
		} as InstanceMetadata,
);

export const fetchInstance = async (): Promise<void> => {
	const meta = await api('meta', {
		detail: false,
	});

	for (const [k, v] of Object.entries(meta)) {
		instance[k] = v;
	}

	localStorage.setItem('instance', JSON.stringify(instance));
};

export const emojiCategories = computed(() => {
	if (instance.emojis == null) return [];
	const categories = new Set<string>();
	for (const emoji of instance.emojis) {
		categories.add(emoji.category);
	}
	return Array.from(categories);
});

export const emojiTags = computed(() => {
	if (instance.emojis == null) return [];
	const tags = new Set<string>();
	for (const emoji of instance.emojis) {
		for (const tag of emoji.aliases) {
			tags.add(tag);
		}
	}
	return Array.from(tags);
});
