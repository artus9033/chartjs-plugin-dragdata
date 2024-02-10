import path from "path";

import { test } from "@playwright/test";

import { TestScenarios } from "../../__data__/data";
import { MagnetImplementations, MagnetVariant } from "../../__utils__/magnet";
import { AxisSpec } from "../../__utils__/structures/axisSpec";

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export type SetupTestOptions = {
	fileName: keyof typeof TestScenarios;
	draggableAxis: AxisSpec;
	disablePlugin?: boolean;
	magnet?: MagnetVariant;
};

export async function setupEachTest(options: SetupTestOptions) {
	test.beforeEach(async ({ page }, testInfo) => {
		testInfo.snapshotSuffix = ""; // disable per-platform screenshot snapshots

		options.disablePlugin = options.disablePlugin ?? false;

		const scenario = TestScenarios[options.fileName];

		const testChartSetupOptions: TestChartSetupOptions = {
			...options,
			isTest: true,
			configurationOverrides: scenario.configuration,
			roundingPrecision: scenario.roundingPrecision,
		};

		for (const key of Object.keys(options) as (keyof SetupTestOptions)[]) {
			switch (key) {
				case "fileName":
				default:
					// skip these properties - they are spread to testChartSetupOptions above but do not have any side effects
					continue;

				case "magnet":
					if (options.magnet) {
						const magnetImpl = MagnetImplementations[options.magnet];

						if (magnetImpl) {
							testChartSetupOptions.magnetImplSerialized =
								magnetImpl.toString();
						}
					}

					break;
			}
		}

		await page.goto(
			`file://${path.dirname(__filename)}/../../../demos/dist/${options.fileName}`,
		);
		await page.waitForLoadState("load");

		// run the actual setup function in browser context
		await page.evaluate(
			({ testChartSetupOptions }) => {
				window.setupTest(testChartSetupOptions);
			},
			{ testChartSetupOptions: testChartSetupOptions as any },
		);

		// since the plugin script is lazily loaded based on URL search params,
		// the below is to stably check whether the page is ready for real
		await page.waitForFunction(() => window.isTestReady);
	});
}
