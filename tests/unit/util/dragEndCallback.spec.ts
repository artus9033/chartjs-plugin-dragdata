import { Chart, InteractionItem } from "chart.js";

// somehow, types for jest-extended matchers in this subdirectory don't work without an explicit import
import "jest-extended";

import ChartJSDragDataPlugin, {
	type DragDataEvent,
	type DragEventCallback,
	PluginConfiguration,
	dragEndCallback,
} from "../../../dist/test/chartjs-plugin-dragdata-test";
import { isTestsConfigWhitelistItemAllowed } from "../../__utils__/testsConfig";
import { setupChartInstance } from "../__utils__/utils";

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
		callback = jest.fn();

		chartInstance = setupChartInstance("line", {
			plugins: {
				dragData: {
					round: 4,
					onDragEnd: callback,
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
	});

	it("should return early if state is undefined", () => {
		dragEndCallback<"line">({} as DragDataEvent, { id: 99, config: {} } as any);

		expect(callback).not.toHaveBeenCalled();
	});

	it("should re-enable the tooltip animation", () => {
		chartInstance.config.options = {
			plugins: {
				tooltip: { animation: {} },
			},
		};

		const chartUpdateFunctionSpy = jest.spyOn(chartInstance, "update");

		dragEndCallback<"line">({} as DragDataEvent, chartInstance);
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

				const expectedValue = withMagnet
					? mockedMagnetReturnValue
					: chartInstance.data.datasets[element.datasetIndex].data[
							element.index
						];

				dragEndCallback<"line">(event, chartInstance);

				expect(callback).toHaveBeenCalledWith(
					event,
					element.datasetIndex,
					element.index,
					expectedValue,
				);
				expect(
					ChartJSDragDataPlugin.statesStore.get(chartInstance.id)?.isDragging,
				).toBe(false);
			});
		});
	}
});
