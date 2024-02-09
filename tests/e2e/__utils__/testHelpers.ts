import fs from "fs";
import path from "path";

import { test } from "playwright-test-coverage";

import { TestScenarios } from "../../__data__/data";
import { isWhitelistItemAllowed } from "../../__utils__/testsConfig";
import { demosDistDirPath } from "./paths";

export function describeEachChartType(
	testGenerator: (
		fileName: string,
		scenario: (typeof TestScenarios)[keyof typeof TestScenarios],
	) => void | Promise<void>,
) {
	for (const fileName of fs
		.readdirSync(demosDistDirPath)
		.filter(
			(file) => !fs.lstatSync(path.join(demosDistDirPath, file)).isDirectory(),
		) as (keyof typeof TestScenarios)[]) {
		(path.extname(fileName) === ".html" &&
			isWhitelistItemAllowed("e2e", "whitelistedHTMLFiles", fileName)
			? test.describe
			: test.describe.skip)(`${fileName.split(".")[0]} chart`, async () => {
			const scenario = TestScenarios[fileName];

			await testGenerator(fileName, scenario);
		});
	}
}
