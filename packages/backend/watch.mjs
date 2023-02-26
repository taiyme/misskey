import { execa } from 'execa';

(async () => {
	execa('swc', ['src', '-d', 'built', '-D', '-w'], {
		stdout: process.stdout,
		stderr: process.stderr,
	});
})();
