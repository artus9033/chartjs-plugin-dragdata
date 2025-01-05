import fs from "fs";
import path from "path";
import { test } from "playwright-test-coverage";

import { TestScenarios } from "../../__data__/data";
import { isTestsConfigWhitelistItemAllowed } from "../../__utils__/testsConfig";
import { e2ePagesDistDirPath } from "./paths";
import { TestSuiteIdentifier } from "./types";

export function describeEachChartType(
	testGenerator: (
		fileName: keyof typeof TestScenarios,
		scenario: (typeof TestScenarios)[keyof typeof TestScenarios],
	) => void | Promise<void>,
	/** used for excluding pages from specific test suites based on their configuration in tests/__data__/data.ts */
	testSuiteIdentifier: TestSuiteIdentifier,
) {
	for (const fileName of fs
		.readdirSync(e2ePagesDistDirPath)
		.filter(
			(file) =>
				!fs.lstatSync(path.join(e2ePagesDistDirPath, file)).isDirectory(),
		) as (keyof typeof TestScenarios)[]) {
		const scenario = TestScenarios[fileName];

		(path.extname(fileName) === ".html" &&
			isTestsConfigWhitelistItemAllowed(
				"e2e",
				"whitelistedHTMLFiles",
				fileName,
			) &&
			scenario.skipE2ETesting !== true &&
			!scenario.excludedTestSuites?.includes(testSuiteIdentifier)
			? test.describe
			: test.describe.skip)(`${fileName.split(".")[0]} chart`, async () => {
			await testGenerator(fileName, scenario);
		});
	}
}

export function hasGUI() {
	if (process.argv.includes("--headed") || process.argv.includes("--ui"))
		process.env.HEADED_MODE = "1";

	return Boolean(process.env.HEADED_MODE);
}
