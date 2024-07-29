import "../../scripts/setupEnv";

import fs from "fs";
import path from "path";

import * as prettier from "prettier";

import type { TestPageBundleFactory } from "./types";
import { requireUncached } from "./utils";

const LOG_TAG = "[Bundler]",
	pagesSrcDirPath = path.join(path.dirname(__filename)),
	/** Dist directory path for GH public demo pages */
	demosDistDirPath = path.join(pagesSrcDirPath, "..", "dist-demos"),
	/** Dist directory path for E2E testing pages using `eval` for injected data from Playwright */
	e2eDistDirPath = path.join(pagesSrcDirPath, "..", "dist-e2e"),
	pagesFactoriesDirPath = path.join(pagesSrcDirPath, "pages"),
	demosAssetsDirPath = path.join(demosDistDirPath, "assets"),
	e2eAssetsDirPath = path.join(e2eDistDirPath, "assets");

function copyAsset(sourcePath: string, destFileName: string) {
	console.log(`${LOG_TAG} Copying asset ${sourcePath} -> ${destFileName}`);

	fs.copyFileSync(sourcePath, path.join(demosAssetsDirPath, destFileName));
	fs.copyFileSync(sourcePath, path.join(e2eAssetsDirPath, destFileName));
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
			"chartjs-plugin-datalabels",
			"dist",
			"chartjs-plugin-datalabels.min.js",
		),
		destFileName: "chartjs-plugin-datalabels.min.js",
	},
	{
		sourcePath: path.join(
			path.dirname(__filename),
			"..",
			"..",
			"node_modules",
			"chartjs-adapter-date-fns",
			"dist",
			"chartjs-adapter-date-fns.bundle.min.js",
		),
		destFileName: "chartjs-adapter-date-fns.bundle.min.js",
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
	if (fs.existsSync(e2eDistDirPath)) {
		fs.rmSync(e2eDistDirPath, { recursive: true });
	}

	fs.mkdirSync(demosDistDirPath, { recursive: true });
	fs.mkdirSync(e2eDistDirPath, { recursive: true });
	fs.mkdirSync(demosAssetsDirPath, { recursive: true });
	fs.mkdirSync(e2eAssetsDirPath, { recursive: true });

	// copy assets
	for (const assetSpec of assetSpecs) {
		copyAsset(assetSpec.sourcePath, assetSpec.destFileName);
	}

	// render EJS to HTML
	for (const demosPageFilename of fs
		.readdirSync(pagesFactoriesDirPath)
		.filter((file) =>
			[".page.js", ".page.ts"].some((ext) => file.endsWith(ext)),
		)) {
		for (const { distDirPath, isE2ETest } of [
			{
				distDirPath: demosDistDirPath,
				isE2ETest: false,
			},
			{
				distDirPath: e2eDistDirPath,
				isE2ETest: true,
			},
		] as {
			distDirPath: string;
			isE2ETest: boolean;
		}[]) {
			try {
				const { default: bundleFactory }: { default: TestPageBundleFactory } =
						requireUncached(
							path.join(pagesFactoriesDirPath, `${demosPageFilename}`),
						),
					bundle = bundleFactory({ isE2ETest });

				for (const bundledPage of Array.isArray(bundle) ? bundle : [bundle]) {
					const htmlDestPath = path.join(
						distDirPath,
						bundledPage.outputFileName,
					);

					console.log(
						`${LOG_TAG} Rendering ${isE2ETest ? "E2E" : "demo"} page ${demosPageFilename} -> ${htmlDestPath}`,
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
				console.error(`${LOG_TAG} Error rendering: ${e}`, (e as any).stack);

				success = false;
			}
		}
	}

	return success;
}

if (require.main === module) {
	// eslint-disable-next-line promise/prefer-await-to-then -- this is the entrypoint, so no need to await
	bundle().catch((e) => {
		console.error(`${LOG_TAG} Bundling has failed: ${e}`, (e as any).stack);
	});
}
