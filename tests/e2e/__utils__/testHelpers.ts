import fs from "fs";
import path from "path";

import { test } from "playwright-test-coverage";

import { TestScenarios } from "../../__data__/data";
import { isTestsConfigWhitelistItemAllowed } from "../../__utils__/testsConfig";
import { e2ePagesDistDirPath } from "./paths";

export function describeEachChartType(
	testGenerator: (
		fileName: keyof typeof TestScenarios,
		scenario: (typeof TestScenarios)[keyof typeof TestScenarios],
	) => void | Promise<void>,
) {
	for (const fileName of fs
		.readdirSync(e2ePagesDistDirPath)
		.filter(
			(file) =>
				!fs.lstatSync(path.join(e2ePagesDistDirPath, file)).isDirectory(),
		) as (keyof typeof TestScenarios)[]) {
		(path.extname(fileName) === ".html" &&
			isTestsConfigWhitelistItemAllowed(
				"e2e",
				"whitelistedHTMLFiles",
				fileName,
			) &&
			TestScenarios[fileName].skipE2ETesting !== true
			? test.describe
			: test.describe.skip)(`${fileName.split(".")[0]} chart`, async () => {
			const scenario = TestScenarios[fileName];

			await testGenerator(fileName, scenario);
		});
	}
}

export function hasGUI() {
	if (process.argv.includes("--headed") || process.argv.includes("--ui"))
		process.env.HEADED_MODE = "1";

	return Boolean(process.env.HEADED_MODE);
}
