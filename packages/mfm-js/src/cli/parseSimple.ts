import { performance } from 'node:perf_hooks';
import { parseSimple } from '../index.js';
import inputLine, { InputCanceledError } from './misc/inputLine.js';

async function entryPoint(): Promise<void> {
	console.log('intaractive simple parser');

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	while (true) {
		let input: string;
		try {
			input = await inputLine('> ');
		} catch (err) {
			if (err instanceof InputCanceledError) {
				console.log('bye.');
				return;
			}
			throw err;
		}

		// replace special chars
		input = input
			.replace(/\\n/g, '\n')
			.replace(/\\t/g, '\t')
			.replace(/\\u00a0/g, '\u00a0');

		try {
			const parseTimeStart = performance.now();
			const result = parseSimple(input);
			const parseTimeEnd = performance.now();
			console.log(JSON.stringify(result));
			const parseTime = (parseTimeEnd - parseTimeStart).toFixed(3);
			console.log(`parsing time: ${parseTime}ms`);
		} catch (err) {
			console.log('parsing error:');
			console.log(err);
		}
		console.log();
	}
}

entryPoint()
	.catch(err => {
		console.log(err);
		process.exit(1);
	});
