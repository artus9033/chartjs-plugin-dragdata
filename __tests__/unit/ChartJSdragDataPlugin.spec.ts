import { Chart, ChartTypeRegistry } from "chart.js";
import d3Drag from "d3-drag";
import d3Selection from "d3-selection";

import { jest } from "@jest/globals";

import ChartJSdragDataPlugin, {
	exportsForTesting,
} from "../../dist/chartjs-plugin-dragdata-test";

jest.mock("d3-drag", () => ({
	drag: jest.fn(() => ({
		container: jest.fn().mockReturnThis(),
		on: jest.fn().mockReturnThis(),
		apply: jest.fn().mockReturnThis(),
	})),
}));

jest.mock("d3-selection", () => {
	return {
		select: jest.fn().mockReturnThis(),
		call: jest
			.fn((...args: any[]) => {
				var callback = args[0];
				args[0] = this;
				(callback as any).apply(null, args);
				return this;
			})
			.mockReturnThis(),
	};
});

describe("ChartJSdragDataPlugin", () => {
	describe.each<keyof ChartTypeRegistry>([
		"line",
		// "bar",
		// "scatter",
		// "bubble",
		// "polarArea",
		// "radar",
	])("%s chart", (chartType) => {
		let chartInstance: Chart<typeof chartType>;

		beforeEach(() => {
			let canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d")!;

			chartInstance = new Chart(ctx, {
				options: {
					plugins: {
						// @ts-ignore next line - TODO: fix this later with proper TS typings
						dragData: {
							round: 2,
							magnet: {
								to: jest.fn(),
								pluginOptions: {
									onDragStart: jest.fn(),
									onDrag: jest.fn(),
									onDragEnd: jest.fn(),
								},
							},
						},
					},
				},
				type: "bar",
				data: {
					datasets: [
						{
							data: [1, 2, 3],
						},
					],
				},
				scales: {
					xAxisID: {
						max: 10,
						min: 0,
					},
					yAxisID: {
						max: 10,
						min: 0,
					},
				},
				getDatasetMeta: jest.fn(),
				getElementsAtEventForMode: jest.fn(),
				update: jest.fn(),
			});

			Chart.register(ChartJSdragDataPlugin);

			// ChartJSdragDataPlugin.afterInit(chartInstance);
		});

		afterEach(() => {
			jest.restoreAllMocks(); // undo spyOn() calls
			jest.clearAllMocks(); // clear mocks
		});

		test(`plugin should be accepted by chart.js register() method`, () => {
			expect(Chart.registry.getPlugin(ChartJSdragDataPlugin.id)).toEqual(
				ChartJSdragDataPlugin,
			);
		});

		test("should register canvas via d3's select & pass in drag() handler instance", async () => {
			expect(d3Selection.select).toHaveBeenCalledWith(chartInstance.canvas);

			expect(d3Selection.call).toHaveBeenCalledTimes(1);
			expect(d3Selection.call).toHaveBeenCalledWith(
				d3Drag.drag.mock.results[0].value,
			);
		});

		test("should register a drag listener bound to the canvas", () => {
			expect(d3Drag.drag).toHaveBeenCalledTimes(1);

			const d3DragContainerFun = d3Drag.drag.mock.results[0].value.container;

			// test if drag()'s return instance's container() method had been called with the canvas instance
			expect(d3DragContainerFun).toHaveBeenCalledTimes(1);
			expect(d3DragContainerFun).toHaveBeenCalledWith(chartInstance.canvas);
		});

		test("should register drag event listeners", () => {
			expect(d3Drag.drag).toHaveBeenCalledTimes(1);
			const d3DragOnFun = d3Drag.drag.mock.results[0].value.on;

			// test if drag()'s return instance's on() method had been called with the correct event types & handlers
			expect(d3DragOnFun).toHaveBeenCalledTimes(3);
			expect(d3DragOnFun).toHaveBeenCalledWith("start", expect.any(Function));
			expect(d3DragOnFun).toHaveBeenCalledWith("drag", expect.any(Function));
			expect(d3DragOnFun).toHaveBeenCalledWith("end", expect.any(Function));
		});
	});
});
