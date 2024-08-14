import {
	InteractionMode,
	InteractionOptions,
	PointElement,
	Chart as TChart,
} from "chart.js";

import ChartJSdragDataPlugin, {
	exportsForTesting,
} from "../../dist/chartjs-plugin-dragdata-test";
import { maxValueCustomMode, setupChartInstance } from "./__utils__/utils";

const { getElement, getStateVarElement } = exportsForTesting;

const DEFAULT_GET_ELEMENTS_AT_EVENT_MOCK_RETURN_VALUE = [
	{ index: 0, datasetIndex: 0, element: new PointElement({}) },
	{ index: 0, datasetIndex: 1, element: new PointElement({}) },
];

describe("getElement", () => {
	describe("line chart with custom interaction mode", () => {
		let chartInstance: TChart<"line">;
		let interactionMode: InteractionMode;
		let interactionOptions: InteractionOptions;

		beforeEach(() => {
			Chart.Interaction.modes.maxValueCustomMode = maxValueCustomMode;

			chartInstance = setupChartInstance("line", {
				interaction: {
					mode: "maxValueCustomMode" as any,
				},
			});

			// mock getElementsAtEventForMode to always return items at first data index from both datasets
			chartInstance.getElementsAtEventForMode = jest.fn(
				(_e, _mode, _options) =>
					DEFAULT_GET_ELEMENTS_AT_EVENT_MOCK_RETURN_VALUE,
			);

			Chart.register(ChartJSdragDataPlugin);

			interactionMode =
				chartInstance.config.options?.interaction?.mode ?? "nearest";
			interactionOptions = chartInstance.config.options?.interaction ?? {
				intersect: true,
			};
		});

		afterEach(() => {
			jest.restoreAllMocks(); // undo spyOn() calls
			jest.clearAllMocks(); // clear mocks
		});

		test("getElement should properly call getElementsAtEventForMode & select first returned point", () => {
			const evtMock = {};

			getElement(evtMock, chartInstance);

			expect(chartInstance.getElementsAtEventForMode).toHaveBeenCalledTimes(1);
			expect(chartInstance.getElementsAtEventForMode).toHaveBeenCalledWith(
				evtMock,
				interactionMode,
				interactionOptions,
				false,
			);
			expect(getStateVarElement()).toBe(
				DEFAULT_GET_ELEMENTS_AT_EVENT_MOCK_RETURN_VALUE[0],
			);
		});

		test("getElement should result in selecting null if callback returns false", () => {
			const evtMock = {};

			getElement(evtMock, chartInstance, () => false);

			expect(chartInstance.getElementsAtEventForMode).toHaveBeenCalledTimes(1);
			expect(chartInstance.getElementsAtEventForMode).toHaveBeenCalledWith(
				evtMock,
				interactionMode,
				interactionOptions,
				false,
			);
			expect(getStateVarElement()).toBe(null);
		});
	});
});
