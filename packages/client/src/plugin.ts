import { AiScript, utils, values } from '@syuilo/aiscript';
import { deserialize } from '@syuilo/aiscript/built/serializer';
import { jsToVal } from '@syuilo/aiscript/built/interpreter/util';
import { VFn } from '@syuilo/aiscript/built/interpreter/value';
import { createAiScriptEnv } from '@/scripts/aiscript/api';
import { inputText } from '@/os';
import { Plugin, noteActions, notePostInterruptors, noteViewInterruptors, postFormActions, userActions } from '@/store';

const pluginContexts = new Map<string, AiScript>();

export const install = (plugin: Plugin): void => {
	console.info('Plugin installed:', plugin.name, 'v' + plugin.version);

	const aiscript = new AiScript(createPluginEnv({
		plugin: plugin,
		storageKey: 'plugins:' + plugin.id,
	}), {
		in: (q): Promise<string> => {
			return new Promise(ok => {
				inputText({
					title: q,
				}).then(({ canceled, result: a }) => {
					if (canceled) {
						ok('');
					} else {
						ok(a);
					}
				});
			});
		},
		out: (value: unknown): void => {
			console.log(value);
		},
		log: (): void => {
		},
	});

	initPlugin({ plugin, aiscript });

	aiscript.exec(deserialize(plugin.ast));
};

const createPluginEnv = (opts) => {
	const config = new Map();
	for (const [k, v] of Object.entries(opts.plugin.config || {})) {
		config.set(k, jsToVal(typeof opts.plugin.configData[k] !== 'undefined' ? opts.plugin.configData[k] : v.default));
	}

	return {
		...createAiScriptEnv({ ...opts, token: opts.plugin.token }),
		//#region Deprecated
		'Mk:register_post_form_action': values.FN_NATIVE(([title, handler]) => {
			utils.assertString(title);
			utils.assertFunction(handler);
			registerPostFormAction({ pluginId: opts.plugin.id, title: title.value, handler });
		}),
		'Mk:register_user_action': values.FN_NATIVE(([title, handler]) => {
			utils.assertString(title);
			utils.assertFunction(handler);
			registerUserAction({ pluginId: opts.plugin.id, title: title.value, handler });
		}),
		'Mk:register_note_action': values.FN_NATIVE(([title, handler]) => {
			utils.assertString(title);
			utils.assertFunction(handler);
			registerNoteAction({ pluginId: opts.plugin.id, title: title.value, handler });
		}),
		//#endregion
		'Plugin:register_post_form_action': values.FN_NATIVE(([title, handler]) => {
			utils.assertString(title);
			utils.assertFunction(handler);
			registerPostFormAction({ pluginId: opts.plugin.id, title: title.value, handler });
		}),
		'Plugin:register_user_action': values.FN_NATIVE(([title, handler]) => {
			utils.assertString(title);
			utils.assertFunction(handler);
			registerUserAction({ pluginId: opts.plugin.id, title: title.value, handler });
		}),
		'Plugin:register_note_action': values.FN_NATIVE(([title, handler]) => {
			utils.assertString(title);
			utils.assertFunction(handler);
			registerNoteAction({ pluginId: opts.plugin.id, title: title.value, handler });
		}),
		'Plugin:register_note_view_interruptor': values.FN_NATIVE(([handler]) => {
			utils.assertFunction(handler);
			registerNoteViewInterruptor({ pluginId: opts.plugin.id, handler });
		}),
		'Plugin:register_note_post_interruptor': values.FN_NATIVE(([handler]) => {
			utils.assertFunction(handler);
			registerNotePostInterruptor({ pluginId: opts.plugin.id, handler });
		}),
		'Plugin:open_url': values.FN_NATIVE(([url]) => {
			utils.assertString(url);
			window.open(url.value, '_blank');
		}),
		'Plugin:config': values.OBJ(config),
	};
};

const initPlugin = ({ plugin, aiscript }: {
	plugin: Plugin;
	aiscript: AiScript;
}): void => {
	pluginContexts.set(plugin.id, aiscript);
};

const registerPostFormAction = ({ pluginId, title, handler }: {
	pluginId: string;
	title: string;
	handler: VFn;
}): void => {
	postFormActions.push({
		title, handler: (form, update) => {
			const pluginContext = pluginContexts.get(pluginId);
			if (!pluginContext) return;

			pluginContext.execFn(handler, [utils.jsToVal(form), values.FN_NATIVE(([key, value]) => {
				if (!key || !value) return;

				update(utils.valToJs(key), utils.valToJs(value));
			})]);
		},
	});
};

const registerUserAction = ({ pluginId, title, handler }: {
	pluginId: string;
	title: string;
	handler: VFn;
}): void => {
	userActions.push({
		title, handler: (user) => {
			const pluginContext = pluginContexts.get(pluginId);
			if (!pluginContext) return;

			pluginContext.execFn(handler, [utils.jsToVal(user)]);
		},
	});
};

const registerNoteAction = ({ pluginId, title, handler }: {
	pluginId: string;
	title: string;
	handler: VFn;
}): void => {
	noteActions.push({
		title, handler: (note) => {
			const pluginContext = pluginContexts.get(pluginId);
			if (!pluginContext) return;

			pluginContext.execFn(handler, [utils.jsToVal(note)]);
		},
	});
};

const registerNoteViewInterruptor = ({ pluginId, handler }: {
	pluginId: string;
	handler: VFn;
}): void => {
	noteViewInterruptors.push({
		handler: async (note) => {
			const pluginContext = pluginContexts.get(pluginId);
			if (!pluginContext) return;

			return utils.valToJs(await pluginContext.execFn(handler, [utils.jsToVal(note)]));
		},
	});
};

const registerNotePostInterruptor = ({ pluginId, handler }: {
	pluginId: string;
	handler: VFn;
}): void => {
	notePostInterruptors.push({
		handler: async (note) => {
			const pluginContext = pluginContexts.get(pluginId);
			if (!pluginContext) return;

			return utils.valToJs(await pluginContext.execFn(handler, [utils.jsToVal(note)]));
		},
	});
};
