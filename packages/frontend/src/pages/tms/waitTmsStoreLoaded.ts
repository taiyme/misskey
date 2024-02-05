import { tmsFlaskStore } from '@/tms/flask-store.js';
import { tmsStore } from '@/tms/store.js';

export const ready = async () => await Promise.all([tmsStore.loaded, tmsFlaskStore.loaded]);
