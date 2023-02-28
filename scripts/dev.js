import { execa } from 'execa';
import { existsSync } from 'fs';
import task from 'tasuku';
import path from 'path';
import url from 'url';

(async () => {
	const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
	const logs = ['', '', '', ''];

	await task.group(task => [
		task('pnpm clean', async ({ setTitle }) => {
			await execa('pnpm', ['clean'], {
				cwd: __dirname + '/../',
			});

			setTitle('pnpm clean is complated');
		}),

		task('pnpm build-pre', async ({ setTitle }) => {
			await execa('pnpm', ['build-pre'], {
				cwd: __dirname + '/../',
			});

			setTitle('pnpm build-pre is complated');
		}),
	]);

	await task.group(task => [
		task('pnpm watch on backend', async ({ setOutput }) => {
			let state = false;
			setOutput("watching...");
			execa('pnpm', ['--filter', 'backend', 'watch'], {
				cwd: __dirname + '/../',
			}).stdout.on("data", (msg) => {
				let str = logs[0] + msg.toString();
				const lines = str.split('\n');
				if (lines.length > 10)
					str = lines.slice(-10).join('\n');

				if (str.match(/Watching/))
					state = true;
				setOutput(str);
			});

			while (!state)
				await (new Promise(resolve => setTimeout(resolve, 1000)));
		}),

		task('pnpm watch on client', async ({ setOutput }) => {
			let state = false;
			setOutput("watching...");
			execa('pnpm', ['--filter', 'client', 'watch'], {
				cwd: __dirname + '/../',
			}).stdout.on("data", (msg) => {
				let str = logs[1] + msg.toString();
				const lines = str.split('\n');
				if (lines.length > 10)
					str = lines.slice(-10).join('\n');

				if (str.match(/built in/))
					state = true;
				setOutput(str);
			});

			while (!state)
				await (new Promise(resolve => setTimeout(resolve, 1000)));
		}),

		task('pnpm watch on sw', async ({ setOutput }) => {
			let state = false;
			setOutput("watching...");
			execa('pnpm', ['--filter', 'sw', 'watch'], {
				cwd: __dirname + '/../',
			}).stdout.on("data", (msg) => {
				let str = logs[2] + msg.toString();
				const lines = str.split('\n');
				if (lines.length > 10)
					str = lines.slice(-10).join('\n');

				if (str.match(/watching\.\.\./))
					state = true;
				setOutput(str);
			});

			while (!state)
				await (new Promise(resolve => setTimeout(resolve, 1000)));
		}),
	], {
		concurrency: 3
	});

	await task('pnpm watch', async ({ setOutput }) => {
		let state = false;
		setOutput("watching...");
		execa('pnpm', ['exec', 'gulp', 'watch'], {
			cwd: __dirname + '/../',
		}).stdout.on("data", (msg) => {
			let str = logs[3] + msg.toString();
			const lines = str.split('\n');
			if (lines.length > 10)
				str = lines.slice(-10).join('\n');

			if (str.match(/Finished 'build'/))
				state = true;
			setOutput(str);
		});

		while (!state)
			await (new Promise(resolve => setTimeout(resolve, 1000)));

	});

	const start = async () => {
		try {
			const exist = existsSync(__dirname + '/../packages/backend/built/index.js');
			if (!exist) throw new Error('not exist yet');

			await execa('pnpm', ['start'], {
				cwd: __dirname + '/../',
				stdout: process.stdout,
				stderr: process.stderr,
			});
		} catch (e) {
			await new Promise(resolve => setTimeout(resolve, 3000));
			start();
		}
	};

	await start();
})();
