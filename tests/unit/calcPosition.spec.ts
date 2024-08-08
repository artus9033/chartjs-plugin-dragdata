import { Chart, ChartConfiguration, ChartType } from "chart.js";
import _ from "lodash";
import { exportsForTesting } from "../../dist/chartjs-plugin-dragdata-test-browser";
import { genericChartScenarioBase } from "../__data__/data";
import { isTestsConfigWhitelistItemAllowed } from "../__utils__/testsConfig";
import { Point2DObject } from "../__utils__/testTypes";
import {
	assertPointsEqual,
	dataPointCompatFromPoint2D,
	dataPointCompatToPoint2D,
	DEFAULT_TEST_CHART_INSTANCE_HEIGHT,
	DEFAULT_TEST_CHART_INSTANCE_WIDTH,
	setupChartInstance,
	SetupChartInstanceOptions,
} from "./__utils__/utils";

const { calcPosition, getElement } = exportsForTesting;

const xAxisID = "x",
	yAxisID = "y",
	PX_TO_VALUE_X_DIVISOR = 10,
	PX_TO_VALUE_Y_DIVISOR = 20;

const FLOATING_BAR_DATA_POINTS: [number, number][] = [
		[5, 12],
		[0, 19],
		[1, 3],
		[3, 5],
	],
	TEST_SCENARIOS = [
		// line scenario with data of shape number[]
		{
			chartType: "line",
			description: "data of shape number[]",
		},
		// line scenario with data of shape Point2DObject[]
		{
			chartType: "line",
			chartSetupOptions: {
				chartData: {
					...genericChartScenarioBase.configuration.data,
					datasets: genericChartScenarioBase.configuration.data.datasets.map(
						(dataset) => ({
							...dataset,
							data: dataset.data.map((v) => ({
								x: 0.5 * v,
								y: v,
							})),
						}),
					) as any,
				},
			},
			description: "data of shape Point2DObject[]",
		},
		// bar scenario with data of shape number[]
		{
			chartType: "bar",
			description: "data of shape number[]",
		},
		// floating bar scenario (data of shape [number, number][])
		{
			chartType: "bar",
			chartSetupOptions: {
				chartData: {
					labels: ["Red", "Blue", "Yellow", "Green"],
					datasets: [
						{
							label: "test bar data",
							data: FLOATING_BAR_DATA_POINTS,
							fill: true,
							tension: 0.4,
							borderWidth: 1,
							pointHitRadius: 25,
						},
					],
				},
			},
			isFloatingBar: true,
		},
	] as {
		chartType: ChartType;
		chartSetupOptions?: SetupChartInstanceOptions<ChartType>;
		isFloatingBar?: boolean;
		description?: string;
	}[];

(isTestsConfigWhitelistItemAllowed(
	"unit",
	"whitelistedTestCategories",
	"calcPosition",
)
	? describe
	: describe.skip)("calcPosition", () => {
	for (const {
		chartType,
		chartSetupOptions,
		isFloatingBar = false,
		description,
	} of TEST_SCENARIOS)
		describe(`${isFloatingBar ? "floating " : ""}${chartType} chart${description ? `, ${description}` : ""}`, () => {
			let chartInstance: Chart;
			let testDataPoint: Point2DObject;

			// make clientX & clientY mutable (they are readonly in MouseEvent)
			let mouseEvent: Partial<
				MouseEvent & { clientX: number; clientY: number }
			>;

			beforeEach(() => {
				// mock required chart methods for unit tests to work
				chartInstance = setupChartInstance(
					chartType,
					{
						plugins: {
							// TODO: fix this later with proper TS typings
							// @ts-ignore next line
							dragData: {
								round: 2,
								dragX: true,
								dragY: true,
							},
						},
						indexAxis: "x",
					},
					_.cloneDeep(chartSetupOptions), // so that the options are not mutated in-between tests
				);

				chartInstance.getElementsAtEventForMode = () => [
					{
						datasetIndex: 0,
						index: 0,
						element: {
							x: testDataPoint.x,
							y: testDataPoint.y,
							active: true,
							$animations: {},
							options: {},
							tooltipPosition: () => ({
								x: testDataPoint.x,
								y: testDataPoint.y,
							}),
							getProps() {
								return {};
							},
							hasValue() {
								return true;
							},
						},
					},
				];

				const origGetDatasetMeta =
					chartInstance.getDatasetMeta.bind(chartInstance);
				chartInstance.getDatasetMeta = (datasetIndex) => ({
					...origGetDatasetMeta(datasetIndex),
					// mock the IDs for axes
					xAxisID,
					yAxisID,
				});

				// virtual pixel-to-value calculations
				chartInstance.scales[xAxisID] = {
					getValueForPixel: jest.fn((pixel) => pixel / PX_TO_VALUE_X_DIVISOR),
					min: 0,
					max: 100,
				} as any;
				chartInstance.scales[yAxisID] = {
					getValueForPixel: jest.fn((pixel) => pixel / PX_TO_VALUE_Y_DIVISOR),
					min: 0,
					max: 50,
				} as any;

				// default test scenario variables, they may altered by tests
				testDataPoint = { x: 5, y: 10 };

				mouseEvent = {
					clientX: 50,
					clientY: 200,
					type: "click",
				};

				// final preparation: initializes all proper variables in the dragdata plugin
				getElement(mouseEvent, chartInstance, () => {});
			});

			// test to prevent regression of https://github.com/artus9033/chartjs-plugin-dragdata/issues/96
			it("should not mutate chart data nor the passed in data point", () => {
				// freeze the datasets to ensure they cannot be mutated
				for (const dataset of chartInstance.data.datasets) {
					for (const dataPoint of dataset.data) {
						Object.freeze(dataPoint);
					}
				}

				// freeze the test data point argument to ensure it cannot be mutated
				const frozenDataPoint = Object.freeze(
					dataPointCompatFromPoint2D(
						testDataPoint,
						(chartInstance.config as ChartConfiguration).type,
					),
				);

				function calcPositionWrapper() {
					calcPosition(mouseEvent, chartInstance, frozenDataPoint);
				}

				expect(calcPositionWrapper).not.toThrow();
			});

			it("should calculate position properly on mouse event", () => {
				// slightly different scenario for floating bar chart: to simulate dragging the vertical bar by the top edge
				if (isFloatingBar) {
					testDataPoint.y = FLOATING_BAR_DATA_POINTS[0][1] * 1.4; // simulate that the new value is higher
					mouseEvent.clientY =
						FLOATING_BAR_DATA_POINTS[0][1] * PX_TO_VALUE_Y_DIVISOR * 1.4; // simulate the mouse event happening somewhere above the current top edge
				}

				const result = calcPosition(
					mouseEvent,
					chartInstance,
					dataPointCompatFromPoint2D(
						testDataPoint,
						(chartInstance.config as ChartConfiguration).type,
					),
				);
				expect(
					chartInstance.scales[xAxisID].getValueForPixel,
				).toHaveBeenCalledWith(mouseEvent.clientX);

				if (isFloatingBar) {
					// floating bar scenario behaves differently: only the edge of the bar that
					// is closer to the drag point is moved; here we drag the top edge

					// eslint-disable-next-line jest/no-conditional-expect
					expect(result).toStrictEqual([
						FLOATING_BAR_DATA_POINTS[0][0], // this edge should not be moved
						mouseEvent.clientY! / PX_TO_VALUE_Y_DIVISOR, // this edge should be moved
					]);
				} else {
					assertPointsEqual({
						actual: result,
						expected: {
							x: mouseEvent.clientX! / PX_TO_VALUE_X_DIVISOR,
							y: mouseEvent.clientY! / PX_TO_VALUE_Y_DIVISOR,
						},
						indexAxis: chartInstance.config.options!.indexAxis!,
					});
				}
			});

			// a vertical bar only moves on the y-axis and calcPosition always returns the y-axis
			// value for a vertical bar, thus this test is inapplicable to these cases
			(chartType === "bar" ? it.skip : it)(
				"should clamp x-axis to x-scale bounds",
				() => {
					mouseEvent.clientX = DEFAULT_TEST_CHART_INSTANCE_WIDTH + 600; // above max
					const resultMax = calcPosition(
						mouseEvent,
						chartInstance,
						dataPointCompatFromPoint2D(
							testDataPoint,
							(chartInstance.config as ChartConfiguration).type,
						),
					);

					// the below would be a false-positive by eslint, as the block is actually in it or it.skip
					// eslint-disable-next-line jest/no-standalone-expect
					expect(dataPointCompatToPoint2D(resultMax).x).toStrictEqual(
						chartType === "bar"
							? testDataPoint.x
							: chartInstance.scales[xAxisID].max,
					);

					mouseEvent.clientX = -600; // below min
					const resultMin = calcPosition(
						mouseEvent,
						chartInstance,
						dataPointCompatFromPoint2D(
							testDataPoint,
							(chartInstance.config as ChartConfiguration).type,
						),
					);

					// the below would be a false-positive by eslint, as the block is actually in it or it.skip
					// eslint-disable-next-line jest/no-standalone-expect
					expect(dataPointCompatToPoint2D(resultMin).x).toStrictEqual(
						// a vertical floating bar only moves on the y-axis, thus in this case, the x-axis value should remain unchanged
						chartType === "bar"
							? testDataPoint.x
							: chartInstance.scales[xAxisID].min,
					);
				},
			);

			it("should clamp y-axis to y-scale bounds", () => {
				mouseEvent.clientY = DEFAULT_TEST_CHART_INSTANCE_HEIGHT + 600; // above max
				const resultMax = calcPosition(
					mouseEvent,
					chartInstance,
					dataPointCompatFromPoint2D(
						testDataPoint,
						(chartInstance.config as ChartConfiguration).type,
					),
				);

				expect(dataPointCompatToPoint2D(resultMax).y).toStrictEqual(
					chartInstance.scales[yAxisID].max,
				);

				mouseEvent.clientY = -600; // below min
				const resultMin = calcPosition(
					mouseEvent,
					chartInstance,
					dataPointCompatFromPoint2D(
						testDataPoint,
						(chartInstance.config as ChartConfiguration).type,
					),
				);

				expect(
					dataPointCompatToPoint2D(resultMin)[
						isFloatingBar
							? // in case of the floating bar, it is the bottom edge that has been dragged,
								// thus we have to compare the first coordinate; dataPointCompatToPoint2D maps
								// the first coordinate to x and the second y
								"x"
							: "y"
					],
				).toStrictEqual(chartInstance.scales[yAxisID].min);
			});

			// below it block is a false-positive for eslint, as it uses assertPointsEqual, which in fact asserts with expect()
			// eslint-disable-next-line jest/expect-expect
			it("should not drag x-axis if dragX is false", () => {
				// TODO: fix this later with proper TS typings
				(chartInstance.config.options!.plugins as any).dragData!.dragX = false;

				mouseEvent.clientY = DEFAULT_TEST_CHART_INSTANCE_WIDTH;
				const result = calcPosition(
					mouseEvent,
					chartInstance,
					dataPointCompatFromPoint2D(
						testDataPoint,
						(chartInstance.config as ChartConfiguration).type,
					),
				);

				assertPointsEqual({
					expected: {
						x: testDataPoint.x, // x should be unchanged
						y: mouseEvent.clientY / PX_TO_VALUE_Y_DIVISOR, // y should be changed
					},
					actual: result,
					indexAxis: chartInstance.config.options!.indexAxis!,
				});
			});

			// below it block is a false-positive for eslint, as it uses assertPointsEqual, which in fact asserts with expect()
			// eslint-disable-next-line jest/expect-expect
			it("should not drag y-axis if dragY is false", () => {
				// TODO: fix this later with proper TS typings
				(chartInstance.config.options!.plugins as any).dragData.dragY = false;

				const result = calcPosition(
					mouseEvent,
					chartInstance,
					dataPointCompatFromPoint2D(
						testDataPoint,
						(chartInstance.config as ChartConfiguration).type,
					),
				);

				assertPointsEqual({
					expected: {
						x: mouseEvent.clientX! / PX_TO_VALUE_X_DIVISOR, // x should be changed
						y: testDataPoint.y, // y should be unchanged
					},
					actual: result,
					indexAxis: chartInstance.config.options!.indexAxis!,
				});
			});
		});
});
