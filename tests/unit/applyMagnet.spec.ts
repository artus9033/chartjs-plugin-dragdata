import { Chart, ChartType } from "chart.js";

import { applyMagnet } from "../../dist/test/chartjs-plugin-dragdata-test";
import { OptionalPluginConfiguration } from "../../src";
import { isTestsConfigWhitelistItemAllowed } from "../__utils__/testsConfig";
import { UNIT_TEST_CHART_TYPES } from "./__utils__/constants";
import { setupChartInstance } from "./__utils__/utils";

(isTestsConfigWhitelistItemAllowed(
	"unit",
	"whitelistedTestCategories",
	"applyMagnet",
)
	? describe
	: describe.skip)("applyMagnet", () => {
	for (const chartType of UNIT_TEST_CHART_TYPES) {
		let chartInstance: Chart;

		(isTestsConfigWhitelistItemAllowed(
			"unit",
			"whitelistedTestedChartTypes",
			chartType,
		)
			? describe
			: describe.skip)(`${chartType} chart`, () => {
			beforeEach(() => {
				chartInstance = setupChartInstance(chartType as ChartType, {
					plugins: { dragData: {} },
				});
			});

			it("should return the original data point if magnet is not configured", () => {
				const result = applyMagnet(chartInstance, 0, 1);
				expect(result).toBe(chartInstance.data.datasets[0].data[1]);
			});

			it("should update the data point using the magnet function", () => {
				const magnetFunction = jest.fn().mockReturnValue(99.234);
				(chartInstance.config.options!.plugins!
					.dragData as OptionalPluginConfiguration<typeof chartType>)!.magnet =
					{
						to: magnetFunction,
					};

				const chartUpdateSpy = jest.spyOn(chartInstance, "update");

				// since applyMagnet mutates the data point, we need to store the original value
				const dataPointBeforeMutation = chartInstance.data.datasets[0].data[1];

				const result = applyMagnet(chartInstance, 0, 1);
				expect(magnetFunction).toHaveBeenCalledExactlyOnceWith(
					dataPointBeforeMutation,
				);

				expect(result).toBe(magnetFunction());

				expect(chartUpdateSpy).toHaveBeenCalledExactlyOnceWith("none");
			});
		});
	}
});
