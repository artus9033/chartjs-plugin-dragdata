import { Chart, InteractionItem } from "chart.js";
import "jest-extended"; // somehow, types for jest-extended matchers in this subdirectory don't work without an explicit import

import ChartJSDragDataPlugin, {
	PluginConfiguration,
	applyMagnet,
	dragEndCallback,
	type DragDataEvent,
	type DragEventCallback,
} from "../../../dist/test/chartjs-plugin-dragdata-test";
import { isTestsConfigWhitelistItemAllowed } from "../../__utils__/testsConfig";
import { setupChartInstance } from "../__utils__/utils";

jest.mock("../../../dist/test/chartjs-plugin-dragdata-test", () => {
	const actual = jest.requireActual(
		"../../../dist/test/chartjs-plugin-dragdata-test",
	);

	return {
		...actual,
		applyMagnet: jest.fn((...args) => actual.applyMagnet(...args)),
		__esModule: true,
	};
});

const rAxisID = "y";

(isTestsConfigWhitelistItemAllowed(
	"unit",
	"whitelistedTestCategories",
	"dragEndCallback",
)
	? describe
	: describe.skip)("dragEndCallback", () => {
	let chartInstance: Chart<"line">;
	let callback: jest.Mock<
		ReturnType<DragEventCallback<"line">>,
		Parameters<DragEventCallback<"line">>
	>;

	beforeEach(() => {
		chartInstance = setupChartInstance("line", {
			plugins: {
				dragData: {
					round: 4,
				},
			},
			scales: {
				[rAxisID]: {
					max: 100,
					min: 0,
					reverse: false,
				},
			},
		});
		callback = jest.fn();
	});

	it("should return early if state is undefined", () => {
		dragEndCallback<"line">({} as DragDataEvent, { id: 99 } as any, callback);
		expect(callback).not.toHaveBeenCalled();
	});

	it("should re-enable the tooltip animation", () => {
		chartInstance.config.options = {
			plugins: {
				tooltip: { animation: {} },
			},
		};

		const chartUpdateFunctionSpy = jest.spyOn(chartInstance, "update");

		dragEndCallback<"line">({} as DragDataEvent, chartInstance, callback);
		expect(chartInstance.config.options.plugins?.tooltip?.animation).toBe(
			ChartJSDragDataPlugin.statesStore.get(chartInstance.id)?.eventSettings,
		);

		expect(chartUpdateFunctionSpy).toHaveBeenCalledWith("none");
	});

	for (const withMagnet of [true, false]) {
		// eslint-disable-next-line jest/valid-title
		describe(withMagnet ? "with magnet" : "without magnet", () => {
			it("should invoke callback with correct arguments and update isDragging to false", () => {
				const event = {} as DragDataEvent;
				const mockedMagnetReturnValue = 42;

				if (withMagnet) {
					(chartInstance.options.plugins!
						.dragData as PluginConfiguration<"line">)!.magnet ??= {
						to: () => mockedMagnetReturnValue,
					};
				}

				let element: InteractionItem = {
					datasetIndex: 0,
					index: 1,
					element: {} as any,
				};

				// since no previous interaction had happened, we need to set the element in state manually
				// note that the state before the below was a valid object, but element was null
				ChartJSDragDataPlugin.statesStore.set(chartInstance.id, {
					...ChartJSDragDataPlugin.statesStore.get(chartInstance.id)!,
					element,
					isDragging: true, // we want to set this to true to test if it was properly set to false by dragEndCallback
				});

				dragEndCallback<"line">(event, chartInstance, callback);

				expect(applyMagnet).toHaveBeenCalledExactlyOnceWith(
					chartInstance,
					element.datasetIndex,
					element.index,
				);

				expect(callback).toHaveBeenCalledWith(
					event,
					element.datasetIndex,
					element.index,
					withMagnet
						? mockedMagnetReturnValue
						: chartInstance.data.datasets[element.datasetIndex].data[
								element.index
							],
				);
				expect(
					ChartJSDragDataPlugin.statesStore.get(chartInstance.id)?.isDragging,
				).toBe(false);
			});
		});
	}
});
