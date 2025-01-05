import "../../scripts/setupEnv";

import chokidar from "chokidar";
import path from "path";
import { Signale } from "signale";

import { requireUncached } from "./utils";

const signale = new Signale({
	scope: "Watcher",
});

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
		signale.log("Bundling finished successfully");
	} else {
		signale.fatal("Bundling failed");
	}

	console.log();
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises -- this is the entrypoint
(async function main() {
	const { assetSpecs, bundle } = requireUncached(
		"./bundle",
	) as typeof import("./bundle");

	signale.info(`Watching for changes in ${demosSrcDirPath}`);
	console.log();

	signale.info("Bundling initially at start");

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
		.on("all", async (event, path) => {
			signale.log("Event:", event, path);

			if (bundlerRunning) {
				signale.log("Bundler is already running, skipping this event");
				return;
			}

			signale.log("Starting bundler");

			bundlerRunning = true;

			const success = await bundle();
			logBundlerResult(success);

			bundlerRunning = false;
		});
})();
