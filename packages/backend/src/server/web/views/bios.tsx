/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function BiosPage(props: {
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
					<title>Misskey Repair Tool</title>
					<link rel="stylesheet" href="/static-assets/misc/bios.css" />
				</head>

				<body>
					<header>
						<h1 safe>Misskey Repair Tool {props.version}</h1>
					</header>
					<main>
						<div class="tabs">
							<button id="ls">edit local storage</button>
						</div>
						<div id="content"></div>
					</main>
					<script src="/static-assets/misc/bios.js"></script>
				</body>
			</html>
		</>
	);
}
