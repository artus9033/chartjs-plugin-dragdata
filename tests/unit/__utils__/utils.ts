import { Chart, ChartTypeRegistry } from "chart.js";

import {
	TestChartOptions,
	genericChartScenarioBase,
} from "../../__data__/data";
import {
	UnitTestCategory,
	isTestsConfigWhitelistItemAllowed,
} from "../../__utils__/testsConfig";

export function setupChartInstance<T extends keyof ChartTypeRegistry>(
	chartType: T,
): Chart<T> {
	const canvas = document.createElement("canvas");
	canvas.width = 800;
	canvas.height = 400;
	canvas.style.width = "800px";
	canvas.style.height = "400px";
	var ctx = canvas.getContext("2d")!;

	return new Chart<T>(ctx, {
		type: chartType,
		data: genericChartScenarioBase.configuration.data as any,
		options: TestChartOptions as any,
	});
}

export function unitTestCategoryAllowed(category: UnitTestCategory): boolean {
	return isTestsConfigWhitelistItemAllowed(
		"unit",
		"whitelistedTestCategories",
		category,
	);
}
