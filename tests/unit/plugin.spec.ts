/* eslint-disable jest/no-standalone-expect */
// above: mitigate ESLint false-positive due to wrapping inside conditional test / it.skip

import { Chart, InteractionItem, Plugin } from "chart.js";
import d3Drag, { D3DragEvent } from "d3-drag";
import d3Selection from "d3-selection";

import ChartJSDragDataPlugin from "../../dist/test/chartjs-plugin-dragdata-test";
import { isTestsConfigWhitelistItemAllowed } from "../__utils__/testsConfig";
import { UNIT_TEST_CHART_TYPES } from "./__utils__/constants";
import { setupChartInstance, unitTestCategoryAllowed } from "./__utils__/utils";

const xAxisID = "x",
	yAxisID = "y",
	rAxisID = "r";

(isTestsConfigWhitelistItemAllowed(
	"unit",
	"whitelistedTestCategories",
	"plugin",
)
	? describe
	: describe.skip)("plugin", () => {
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

				Chart.register(ChartJSDragDataPlugin);
			});

			afterEach(() => {
				jest.restoreAllMocks(); // undo spyOn() calls
				jest.clearAllMocks(); // clear mocks
			});

			(unitTestCategoryAllowed("pluginRegistration") ? test : it.skip)(
				`plugin should be accepted by chart.js register() method`,
				() => {
					expect(
						Chart.registry.getPlugin(ChartJSDragDataPlugin.id),
					).toStrictEqual(ChartJSDragDataPlugin);
				},
			);

			(unitTestCategoryAllowed("pluginRegistration") ? test : it.skip)(
				"should register canvas via d3's select & pass in drag() handler instance",
				() => {
					expect(d3Selection.select).toHaveBeenCalledExactlyOnceWith(
						chartInstance.canvas,
					);

					expect(
						(d3Selection as any as jest.Mock).call,
					).toHaveBeenCalledExactlyOnceWith(
						(d3Drag.drag as jest.Mock).mock.results[0].value,
					);
				},
			);

			(unitTestCategoryAllowed("pluginRegistration") ? test : it.skip)(
				`plugin should register proper logic to be executed on beforeEvent`,
				() => {
					const mockedEvent = {
							cancelable: true,
							event: {
								native: null,
								type: "mousedown",
								x: 10,
								y: 15,
							},
							inChartArea: true,
							replay: false,
						} as Parameters<NonNullable<Plugin["beforeEvent"]>>[1],
						plugin = Chart.registry.getPlugin(ChartJSDragDataPlugin.id);

					let state = ChartJSDragDataPlugin.statesStore.get(chartInstance.id)!;

					(chartInstance.tooltip as any).update = jest.fn();

					// first, test when isDragging is false - chartInstance.tooltip.update() should not be called
					state.isDragging = false;

					expect(
						plugin!.beforeEvent!(chartInstance as Chart, mockedEvent, {}),
					).toStrictEqual(undefined); // nothing should be returned (void)
					expect((chartInstance.tooltip as any).update).not.toHaveBeenCalled();

					// then, test when isDragging is true - chartInstance.tooltip.update() should be called
					state.isDragging = true;

					expect(
						plugin!.beforeEvent!(chartInstance as Chart, mockedEvent, {}),
					).toStrictEqual(false); // false should be returned
					expect((chartInstance.tooltip as any).update).toHaveBeenCalledTimes(
						1,
					);
				},
			);

			(unitTestCategoryAllowed("dragListenersRegistration") ? test : it.skip)(
				"should register a drag listener bound to the canvas",
				() => {
					expect(d3Drag.drag).toHaveBeenCalledTimes(1);

					const d3DragContainerFun = (d3Drag.drag as any as jest.Mock).mock
						.results[0].value.container;

					// test if drag()'s return instance's container() method had been called with the canvas instance
					expect(d3DragContainerFun).toHaveBeenCalledExactlyOnceWith(
						chartInstance.canvas,
					);
				},
			);

			(unitTestCategoryAllowed("dragListenersRegistration") ? test : it.skip)(
				"should register drag event listeners",
				() => {
					expect(d3Drag.drag).toHaveBeenCalledTimes(1);

					const d3DragOnFun = (d3Drag.drag as any as jest.Mock).mock.results[0]
						.value.on;

					const onDragStartCbMock = jest.fn(),
						onDragCbMock = jest.fn(),
						onDragEndCbMock = jest.fn();

					chartInstance.options.plugins!.dragData = {
						onDragStart: onDragStartCbMock,
						onDrag: onDragCbMock,
						onDragEnd: onDragEndCbMock,
					};

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

					const calls = (d3DragOnFun as jest.Mock).mock.calls as [
						"start" | "drag" | "end",
						Function,
					][];

					const startCallCallbackArg = calls.find(
							([eventType]) => eventType === "start",
						)![1],
						dragCallCallbackArg = calls.find(
							([eventType]) => eventType === "drag",
						)![1],
						endCallCallbackArg = calls.find(
							([eventType]) => eventType === "end",
						)![1];

					const eventMock = {
						target: {} as any,
						active: 0,
						dx: 0,
						dy: 0,
						x: 10,
						y: 15,
						subject: {},
						type: "mousedown",
						identifier: "mouse",
						sourceEvent: {
							test: 2,
						},
						on() {
							return {} as any;
						},
					} as D3DragEvent<HTMLCanvasElement, unknown, unknown>;

					const element: InteractionItem = {
						datasetIndex: 0,
						index: 1,
						element: {} as any,
					};

					chartInstance.getElementsAtEventForMode = jest.fn(
						(_e, _mode, _options) => [element],
					);

					const origGetDatasetMeta =
						chartInstance.getDatasetMeta.bind(chartInstance);
					chartInstance.getDatasetMeta = (datasetIndex) => ({
						...origGetDatasetMeta(datasetIndex),
						// mock the IDs for axes
						xAxisID,
						yAxisID,
						rAxisID,
					});

					// make update() work without errors
					chartInstance.update = jest.fn();

					// virtual pixel-to-value calculations
					chartInstance.scales[xAxisID] = {
						getValueForPixel: jest.fn((pixel) => pixel),
					} as any;
					chartInstance.scales[yAxisID] = {
						getValueForPixel: jest.fn((pixel) => pixel),
					} as any;
					chartInstance.scales[rAxisID] = {
						getPointPositionForValue: jest.fn((value) => value),
						getValueForDistanceFromCenter: jest.fn((value) => value),
					} as any;

					// TODO: since it is hard to spy on getElement, for now only toString() is checked; this should be reorganized in the future but probably requires more effort
					expect(startCallCallbackArg.toString()).toContain("getElement");
					expect(dragCallCallbackArg.toString()).toContain("updateData");
					expect(endCallCallbackArg.toString()).toContain("dragEndCallback");

					// verify if callbacks were succesfully fired instead; TODO: make this use spies instead
					startCallCallbackArg(eventMock);
					expect(onDragStartCbMock).toHaveBeenCalledExactlyOnceWith(
						eventMock.sourceEvent,
						element.datasetIndex,
						element.index,
						chartInstance.data.datasets[element.datasetIndex].data[
							element.index
						],
					);

					dragCallCallbackArg(eventMock);
					expect(onDragCbMock).toHaveBeenCalledExactlyOnceWith(
						eventMock.sourceEvent,
						element.datasetIndex,
						element.index,
						chartInstance.data.datasets[element.datasetIndex].data[
							element.index
						],
					);

					endCallCallbackArg(eventMock);
					expect(onDragEndCbMock).toHaveBeenCalledExactlyOnceWith(
						eventMock.sourceEvent,
						element.datasetIndex,
						element.index,
						chartInstance.data.datasets[element.datasetIndex].data[
							element.index
						],
					);
				},
			);
		});
	}
});
