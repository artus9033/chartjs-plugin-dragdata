import type { Point, Chart as TChart } from "chart.js";

import {
	type DragDataPluginConfiguration,
	type DraggingConfiguration,
	checkDraggingConfiguration,
	getElement,
} from "../../dist/test/chartjs-plugin-dragdata-test";
import { isTestsConfigWhitelistItemAllowed } from "../__utils__/testsConfig";
import { setupChartInstance } from "./__utils__/utils";

/**
 * The default configuration of dragging that should be calculated when
 * no dragging options (or default values) are passed to chart
 */
const VANILLA_DEFAULT_CONFIG: DraggingConfiguration = {
		chartDraggingDisabled: false,
		datasetDraggingDisabled: false,
		xAxisDraggingDisabled: true,
		yAxisDraggingDisabled: false,
		dataPointDraggingDisabled: false,
	},
	/**
	 * The default configuration of dragging that is set up in beforeAll() call
	 */
	TEST_SETUP_DEFAULT_CONFIG: DraggingConfiguration = {
		...VANILLA_DEFAULT_CONFIG,
		xAxisDraggingDisabled: false,
	};

const xAxisID = "x",
	yAxisID = "y";

(isTestsConfigWhitelistItemAllowed(
	"unit",
	"whitelistedTestCategories",
	"checkDraggingConfiguration",
)
	? describe
	: describe.skip)("checkDraggingConfiguration", () => {
	let chartInstance: TChart<"line">;

	beforeEach(() => {
		// mock required chart methods for unit tests to work
		chartInstance = setupChartInstance(
			"line",
			{
				plugins: {
					dragData: {
						round: 2,
						dragX: true,
						dragY: true,
					},
				},
				indexAxis: "x",
			},
			{
				chartData: {
					datasets: [
						{
							data: [
								{ x: 10, y: 20 },
								{ x: 20, y: 30 },
								{ x: 30, y: 40 },
								{ x: 40, y: 50 },
								{ x: 50, y: 60 },
							],
						},
						{
							data: [
								{ x: 15, y: 25 },
								{ x: 25, y: 35 },
								{ x: 35, y: 45 },
								{ x: 45, y: 55 },
								{ x: 55, y: 65 },
							],
						},
					],
				},
			},
		);

		const origGetDatasetMeta = chartInstance.getDatasetMeta.bind(chartInstance);
		chartInstance.getDatasetMeta = (datasetIndex) => ({
			...origGetDatasetMeta(datasetIndex),
			// mock the IDs for axes
			xAxisID,
			yAxisID,
		});

		chartInstance.getElementsAtEventForMode = () => [
			{
				datasetIndex: 0,
				index: 0,
				element: {
					x: 10,
					y: 20,
					active: true,
					$animations: {},
					options: {},
					tooltipPosition: () => ({
						x: 10,
						y: 20,
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

		// final preparation: initializes all proper variables in the dragdata plugin
		getElement(
			{
				clientX: 50,
				clientY: 200,
				type: "click",
			} as any,
			chartInstance,
		);
	});

	it("has valid default dragging configuration", () => {
		// reset the options to the default state (beforeAll activates dragging on both axes via plugin options)
		chartInstance.options.plugins!.dragData = undefined;

		expect(checkDraggingConfiguration(chartInstance, 0, 0)).toEqual(
			VANILLA_DEFAULT_CONFIG,
		);
	});

	it("disables all drag interactions when chart-level dragging is disabled", () => {
		chartInstance.config.options!.plugins!.dragData = false;

		const allDisabled = {
			chartDraggingDisabled: true,
			datasetDraggingDisabled: true,
			xAxisDraggingDisabled: true,
			yAxisDraggingDisabled: true,
			dataPointDraggingDisabled: true,
		};

		expect(checkDraggingConfiguration(chartInstance, 0, 0)).toEqual(
			allDisabled,
		);
		expect(checkDraggingConfiguration(chartInstance, 0, 4)).toEqual(
			allDisabled,
		);
		expect(checkDraggingConfiguration(chartInstance, 1, 0)).toEqual(
			allDisabled,
		);
		expect(checkDraggingConfiguration(chartInstance, 1, 4)).toEqual(
			allDisabled,
		);
	});

	it("disables dataset-level-and-below drag interactions when dataset dragging is disabled", () => {
		chartInstance.data.datasets[0].dragData = false;

		const datasetDisabledConfig = {
			chartDraggingDisabled: false,
			datasetDraggingDisabled: true,
			xAxisDraggingDisabled: true,
			yAxisDraggingDisabled: true,
			dataPointDraggingDisabled: true,
		};

		expect(checkDraggingConfiguration(chartInstance, 0, 0)).toEqual(
			datasetDisabledConfig,
		);
		expect(checkDraggingConfiguration(chartInstance, 0, 3)).toEqual(
			datasetDisabledConfig,
		);

		// the change for dataset 0 should not affect dataset 1
		expect(checkDraggingConfiguration(chartInstance, 1, 0)).toEqual(
			TEST_SETUP_DEFAULT_CONFIG,
		);
		expect(checkDraggingConfiguration(chartInstance, 1, 3)).toEqual(
			TEST_SETUP_DEFAULT_CONFIG,
		);
	});

	it("disables only x-axis dragging when per-axis option for x-axis is disabled", () => {
		chartInstance.config.options!.scales![xAxisID]!.dragData = false;

		const expectedConfig = {
			...TEST_SETUP_DEFAULT_CONFIG,
			xAxisDraggingDisabled: true,
		};

		expect(checkDraggingConfiguration(chartInstance, 0, 0)).toEqual(
			expectedConfig,
		);
		expect(checkDraggingConfiguration(chartInstance, 1, 3)).toEqual(
			expectedConfig,
		);
	});

	it("does not enable x-axis dragging when per-axis option is set to false and overrides enabled plugin option for x-axis", () => {
		chartInstance.config.options!.scales![xAxisID]!.dragData = false;

		const expectedConfig = {
			...TEST_SETUP_DEFAULT_CONFIG,
			xAxisDraggingDisabled: true,
		};

		expect(checkDraggingConfiguration(chartInstance, 0, 0)).toEqual(
			expectedConfig,
		);
		expect(checkDraggingConfiguration(chartInstance, 1, 3)).toEqual(
			expectedConfig,
		);
	});

	it("disables only y-axis dragging when per-axis option for y-axis is disabled when x-axis dragging is disabled by default", () => {
		chartInstance.config.options!.scales![yAxisID]!.dragData = false;

		const expectedConfig = {
			...TEST_SETUP_DEFAULT_CONFIG,
			yAxisDraggingDisabled: true,
		};

		expect(checkDraggingConfiguration(chartInstance, 0, 0)).toEqual(
			expectedConfig,
		);
		expect(checkDraggingConfiguration(chartInstance, 1, 3)).toEqual(
			expectedConfig,
		);
	});

	it("disables only y-axis dragging when per-axis option for y-axis is disabled when x-axis dragging is enabled", () => {
		// enable dragging the x-axis in scale's options
		chartInstance.config.options!.scales![xAxisID]!.dragData = true;

		// disable dragging the y-axis in scale's options
		chartInstance.config.options!.scales![yAxisID]!.dragData = false;

		const expectedConfig = {
			...TEST_SETUP_DEFAULT_CONFIG,
			xAxisDraggingDisabled: false,
			yAxisDraggingDisabled: true,
		};

		expect(checkDraggingConfiguration(chartInstance, 0, 0)).toEqual(
			expectedConfig,
		);
		expect(checkDraggingConfiguration(chartInstance, 1, 3)).toEqual(
			expectedConfig,
		);
	});

	it("produces proper config for all axes enabled & per-data-point dragging disabled just for one point", () => {
		// enable dragging on all axes in plugin options
		(chartInstance.options!.plugins!
			.dragData as DragDataPluginConfiguration)!.dragX = true;

		// disable dragging for the first point in the first dataset
		(chartInstance.data.datasets[0].data[0] as Point)!.dragData = false;

		const expectedConfigBase = {
				chartDraggingDisabled: false,
				datasetDraggingDisabled: false,
				xAxisDraggingDisabled: false,
				yAxisDraggingDisabled: false,
			},
			expectedConfigForThePoint = {
				...expectedConfigBase,
				dataPointDraggingDisabled: true,
			},
			expectedConfigOtherPoints = {
				...expectedConfigBase,
				dataPointDraggingDisabled: false,
			};

		expect(checkDraggingConfiguration(chartInstance, 0, 0)).toEqual(
			expectedConfigForThePoint,
		);
		expect(checkDraggingConfiguration(chartInstance, 0, 1)).toEqual(
			expectedConfigOtherPoints,
		);
		expect(checkDraggingConfiguration(chartInstance, 1, 0)).toEqual(
			expectedConfigOtherPoints,
		);
		expect(checkDraggingConfiguration(chartInstance, 1, 1)).toEqual(
			expectedConfigOtherPoints,
		);
	});

	it("produces config with all axes disabled for an inexistent chart object", () => {
		const expectedConfig: DraggingConfiguration = {
			chartDraggingDisabled: true,
			datasetDraggingDisabled: true,
			xAxisDraggingDisabled: true,
			yAxisDraggingDisabled: true,
			dataPointDraggingDisabled: true,
		};

		// create a fake chart-like-object that creation of does not call afterInit
		// thus one that does not exist in the state map
		const unregisteredChartInstance = { id: 98732 } as any;

		expect(checkDraggingConfiguration(unregisteredChartInstance, 0, 0)).toEqual(
			expectedConfig,
		);
		expect(checkDraggingConfiguration(unregisteredChartInstance, 0, 1)).toEqual(
			expectedConfig,
		);
		expect(checkDraggingConfiguration(unregisteredChartInstance, 1, 0)).toEqual(
			expectedConfig,
		);
		expect(checkDraggingConfiguration(unregisteredChartInstance, 1, 1)).toEqual(
			expectedConfig,
		);
	});
});
