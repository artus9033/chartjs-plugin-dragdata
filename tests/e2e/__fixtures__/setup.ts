import path from "path";

import { type Page } from "@playwright/test";

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

export async function setupE2ETest(
	options: SetupTestOptions,
	page: Page,
	isMobile: boolean,
) {
	options.disablePlugin = options.disablePlugin ?? false;

	const scenario = TestScenarios[options.fileName];

	const testChartSetupOptions: TestChartSetupOptions = {
		...options,
		isTest: true,
		roundingPrecision: scenario.roundingPrecision,
	};

	if (isMobile) {
		let viewport = page.viewportSize();

		// switch portrait to landscape if needed
		if (viewport?.width && viewport.height) {
			if (scenario.needsHorizontalMobileScreen) {
				page.setViewportSize({
					width: viewport!.height,
					height: viewport!.width,
				});
			}
		}
	}

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
						testChartSetupOptions.magnetImplSerialized = magnetImpl.toString();
					}
				}

				break;
		}
	}

	await page.goto(
		`file://${path.dirname(__filename)}/../../../demos/dist/${options.fileName}?isTest=true`,
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
}
