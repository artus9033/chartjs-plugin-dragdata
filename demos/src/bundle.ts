import "../../scripts/setupEnv";

import fs from "fs";
import path from "path";

import * as prettier from "prettier";

import type { TestPageBundle } from "./types";
import { requireUncached } from "./utils";

const LOG_TAG = "[Bundler]",
	demosSrcDirPath = path.join(path.dirname(__filename)),
	demosDistDirPath = path.join(demosSrcDirPath, "..", "dist"),
	demosPagesSrcDirPath = path.join(demosSrcDirPath, "pages"),
	demosAssetsDirPath = path.join(demosDistDirPath, "assets");

function copyAsset(sourcePath: string, destFileName: string) {
	console.log(`${LOG_TAG} Copying asset ${sourcePath} -> ${destFileName}`);

	fs.copyFileSync(sourcePath, path.join(demosAssetsDirPath, destFileName));
}

export type AssetSpec = {
	sourcePath: string;
	destFileName: string;
};

export const assetSpecs: AssetSpec[] = [
	{
		sourcePath: path.join(
			path.dirname(__filename),
			"..",
			"..",
			"node_modules",
			"lodash",
			"lodash.min.js",
		),
		destFileName: "lodash.min.js",
	},
	{
		sourcePath: path.join(
			path.dirname(__filename),
			"..",
			"..",
			"node_modules",
			"chart.js",
			"dist",
			"chart.umd.js",
		),
		destFileName: "chart.min.js",
	},
	{
		sourcePath: path.join(
			path.dirname(__filename),
			"..",
			"..",
			"dist",
			"chartjs-plugin-dragdata.min.js",
		),
		destFileName: "chartjs-plugin-dragdata.min.js",
	},
	{
		sourcePath: path.join(
			path.dirname(__filename),
			"..",
			"..",
			"dist",
			"chartjs-plugin-dragdata-test-browser.js",
		),
		destFileName: "chartjs-plugin-dragdata-test-browser.js",
	},
];

export async function bundle(): Promise<boolean> {
	let success = true;

	if (fs.existsSync(demosDistDirPath)) {
		fs.rmSync(demosDistDirPath, { recursive: true });
	}

	fs.mkdirSync(demosDistDirPath, { recursive: true });
	fs.mkdirSync(demosAssetsDirPath, { recursive: true });

	// copy assets
	for (const assetSpec of assetSpecs) {
		copyAsset(assetSpec.sourcePath, assetSpec.destFileName);
	}

	// render EJS to HTML
	for (const demosPageFilename of fs
		.readdirSync(demosPagesSrcDirPath)
		.filter((file) =>
			[".page.js", ".page.ts"].some((ext) => file.endsWith(ext)),
		)) {
		try {
			const { default: bundle }: { default: TestPageBundle } = requireUncached(
				path.join(demosPagesSrcDirPath, `${demosPageFilename}`),
			);

			for (const bundledPage of Array.isArray(bundle) ? bundle : [bundle]) {
				const htmlDestPath = path.join(
					demosDistDirPath,
					bundledPage.outputFileName,
				);

				console.log(
					`${LOG_TAG} Rendering ${demosPageFilename} -> ${htmlDestPath}`,
				);

				fs.writeFileSync(
					htmlDestPath,
					await prettier.format(bundledPage.html, {
						parser: "html",
						useTabs: true,
					}),
				);
			}
		} catch (e) {
			console.error(`${LOG_TAG} Error rendering: ${e}`);

			success = false;
		}
	}

	return success;
}

if (require.main === module) {
	bundle();
}
