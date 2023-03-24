import { type ComponentInternalInstance, getCurrentInstance } from 'vue';

export const isDebuggerEnabled = (id: number): boolean => {
	try {
		return localStorage.getItem(`DEBUG_${id}`) !== null;
	} catch {
		return false;
	}
};

export const switchDebuggerEnabled = (id: number, enabled: boolean): void => {
	if (enabled) {
		localStorage.setItem(`DEBUG_${id}`, '');
	} else {
		localStorage.removeItem(`DEBUG_${id}`);
	}
};

export const stackTraceInstances = (): ComponentInternalInstance[] => {
	let instance = getCurrentInstance();
	const stack: ComponentInternalInstance[] = [];
	while (instance) {
		stack.push(instance);
		instance = instance.parent;
	}
	return stack;
};
