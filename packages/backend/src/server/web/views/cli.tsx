/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function CliPage(props: {
	version: string;
}) {
	return (
		<>
			{'<!DOCTYPE html>'}
			<html>
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
					<meta name="application-name" content="Misskey" />
					<title>Misskey CLI Tool</title>

					<link rel="stylesheet" href="/static-assets/misc/cli.css" />
				</head>

				<body>
					<header>
						<h1 safe>Misskey CLI {props.version}</h1>
					</header>
					<main>
						<div id="form">
							<textarea id="text"></textarea>
							<button id="submit">Submit</button>
						</div>
						<div id="tl"></div>
					</main>
					<script src="/static-assets/misc/cli.js"></script>
				</body>
			</html>
		</>
	);
}
