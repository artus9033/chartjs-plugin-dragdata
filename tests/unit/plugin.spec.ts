/* eslint-disable jest/no-standalone-expect */
// above: mitigate ESLint false-positive due to wrapping inside conditional test / test.skip

import { Chart } from "chart.js";
import d3Drag from "d3-drag";
import d3Selection from "d3-selection";

import ChartJSdragDataPlugin from "../../dist/chartjs-plugin-dragdata-test";
import { isTestsConfigWhitelistItemAllowed } from "../__utils__/testsConfig";
import { UNIT_TEST_CHART_TYPES } from "./__utils__/constants";
import { setupChartInstance, unitTestCategoryAllowed } from "./__utils__/utils";

describe("plugin", () => {
	for (const chartType of UNIT_TEST_CHART_TYPES) {
		(isTestsConfigWhitelistItemAllowed(
			"unit",
			"whitelistedTestedChartTypes",
			chartType,
		)
			? describe
			: describe.skip)(`${chartType} chart`, () => {
			let chartInstance: Chart<typeof chartType>;

			beforeEach(() => {
				chartInstance = setupChartInstance(chartType);

				Chart.register(ChartJSdragDataPlugin);
			});

			afterEach(() => {
				jest.restoreAllMocks(); // undo spyOn() calls
				jest.clearAllMocks(); // clear mocks
			});

			(unitTestCategoryAllowed("pluginRegistration") ? test : test.skip)(
				`plugin should be accepted by chart.js register() method`,
				() => {
					expect(
						Chart.registry.getPlugin(ChartJSdragDataPlugin.id),
					).toStrictEqual(ChartJSdragDataPlugin);
				},
			);

			(unitTestCategoryAllowed("pluginRegistration") ? test : test.skip)(
				"should register canvas via d3's select & pass in drag() handler instance",
				() => {
					expect(d3Selection.select).toHaveBeenCalledWith(chartInstance.canvas);

					expect(d3Selection.call).toHaveBeenCalledTimes(1);
					expect(d3Selection.call).toHaveBeenCalledWith(
						d3Drag.drag.mock.results[0].value,
					);
				},
			);

			(unitTestCategoryAllowed("dragListenersRegistration") ? test : test.skip)(
				"should register a drag listener bound to the canvas",
				() => {
					expect(d3Drag.drag).toHaveBeenCalledTimes(1);

					const d3DragContainerFun =
						d3Drag.drag.mock.results[0].value.container;

					// test if drag()'s return instance's container() method had been called with the canvas instance
					expect(d3DragContainerFun).toHaveBeenCalledTimes(1);
					expect(d3DragContainerFun).toHaveBeenCalledWith(chartInstance.canvas);
				},
			);

			(unitTestCategoryAllowed("dragListenersRegistration") ? test : test.skip)(
				"should register drag event listeners",
				() => {
					expect(d3Drag.drag).toHaveBeenCalledTimes(1);
					const d3DragOnFun = d3Drag.drag.mock.results[0].value.on;

					// test if drag()'s return instance's on() method had been called with the correct event types & handlers
					expect(d3DragOnFun).toHaveBeenCalledTimes(3);
					expect(d3DragOnFun).toHaveBeenCalledWith(
						"start",
						expect.any(Function),
					);
					expect(d3DragOnFun).toHaveBeenCalledWith(
						"drag",
						expect.any(Function),
					);
					expect(d3DragOnFun).toHaveBeenCalledWith("end", expect.any(Function));
				},
			);
		});
	}
});
