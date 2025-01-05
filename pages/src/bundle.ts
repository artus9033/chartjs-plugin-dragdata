import "../../scripts/setupEnv";

import fs from "fs";
import path from "path";
import * as prettier from "prettier";
import { Signale } from "signale";

import type { TestPageBundleFactory } from "./types";
import { requireUncached } from "./utils";

const signale = new Signale({
	scope: "[Bundler]",
});

const pagesSrcDirPath = path.join(path.dirname(__filename)),
	/** Dist directory path for GH public demo pages */
	demosDistDirPath = path.join(pagesSrcDirPath, "..", "dist-demos"),
	/** Dist directory path for E2E testing pages using `eval` for injected data from Playwright */
	e2eDistDirPath = path.join(pagesSrcDirPath, "..", "dist-e2e"),
	pagesFactoriesDirPath = path.join(pagesSrcDirPath, "pages"),
	demosAssetsDirPath = path.join(demosDistDirPath, "assets"),
	e2eAssetsDirPath = path.join(e2eDistDirPath, "assets"),
	projectRootAbsPath = path.resolve(
		path.join(path.dirname(__filename), "..", ".."),
	);

function copyAsset(assetSpec: AssetSpec): void {
	signale.log(
		`Copying asset for variants ${assetSpec.variants.join(", ")}: ${assetSpec.sourcePath.replace(projectRootAbsPath, "")} -> ${assetSpec.destFileName}`,
	);

	if (assetSpec.variants.includes("demo")) {
		fs.copyFileSync(
			assetSpec.sourcePath,
			path.join(demosAssetsDirPath, assetSpec.destFileName),
		);
	}

	if (assetSpec.variants.includes("e2e")) {
		fs.copyFileSync(
			assetSpec.sourcePath,
			path.join(e2eAssetsDirPath, assetSpec.destFileName),
		);
	}
}

export type AssetSpec = {
	sourcePath: string;
	destFileName: string;
	variants: AssetSpecVariant[];
};

export type AssetSpecVariant = "demo" | "e2e";

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
		variants: ["demo", "e2e"],
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
		variants: ["demo", "e2e"],
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
		variants: ["demo", "e2e"],
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
		variants: ["demo", "e2e"],
	},
	// demo-only plugin bundle
	{
		sourcePath: path.join(
			path.dirname(__filename),
			"..",
			"..",
			"dist",
			"chartjs-plugin-dragdata.min.js",
		),
		destFileName: "chartjs-plugin-dragdata.min.js",
		variants: ["demo"],
	},
	// test-only plugin bundle
	{
		sourcePath: path.join(
			path.dirname(__filename),
			"..",
			"..",
			"dist",
			"test",
			"chartjs-plugin-dragdata-test-browser.js",
		),
		destFileName: "chartjs-plugin-dragdata-test-browser.js",
		variants: ["e2e"],
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
		copyAsset(assetSpec);
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

					signale.log(
						`Rendering ${isE2ETest ? "E2E" : "demo"} page ${demosPageFilename} -> ${htmlDestPath.replace(projectRootAbsPath, "")}`,
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
				signale.error(`Error rendering: ${e}`, (e as any).stack);

				success = false;
			}
		}
	}

	return success;
}

if (require.main === module) {
	// eslint-disable-next-line promise/prefer-await-to-then -- this is the entrypoint, so no need to await
	bundle().catch((e) => {
		signale.fatal(`Bundling has failed: ${e}`, (e as any).stack);
	});
}
