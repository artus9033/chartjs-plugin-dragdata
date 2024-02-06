import "../../scripts/setupEnv";

import path from "path";

import chokidar from "chokidar";

import { assetSpecs, bundle } from "./bundle";

const demosSrcDirPath = path.dirname(__filename),
	testsDataDefFilePath = path.join(
		path.dirname(__filename),
		"..",
		"..",
		"tests",
		"__data__",
		"data.ts",
	);

let bundlerRunning: boolean = false;

function logBundlerResult(success: boolean) {
	if (success) {
		console.log("[Watcher] Bundling finished successfully");
	} else {
		console.error("[Watcher] Bundling failed");
	}

	console.log();
}

(async function main() {
	console.log(`[Watcher] Watching for changes in ${demosSrcDirPath}`);
	console.log();

	console.log("[Watcher] Bundling initially at start");

	logBundlerResult(await bundle());

	chokidar
		.watch(
			[
				demosSrcDirPath,
				testsDataDefFilePath,
				...assetSpecs.map(({ sourcePath }) => sourcePath),
			],
			{ ignoreInitial: true },
		)
		.on("all", (event, path) => {
			console.log("[Watcher] Event:", event, path);

			if (bundlerRunning) {
				console.log(
					"[Watcher] Bundler is already running, skipping this event",
				);
				return;
			}

			console.log("[Watcher] Starting bundler");

			bundlerRunning = true;

			bundle().then((success) => {
				logBundlerResult(success);

				bundlerRunning = false;
			});
		});
})();
