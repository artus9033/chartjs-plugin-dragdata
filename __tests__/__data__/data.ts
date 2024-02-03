import { ChartConfiguration, ChartOptions } from "chart.js";
import _ from "lodash";
import { TestScenario } from "../__utils__/scenario";
import { DeepPartial } from "chart.js/dist/types/utils";
import testsConfig from "../__utils__/testsConfig";
import Offset2D from "../__utils__/Offset2D";

export const TestChartOptions: ChartOptions = {
	plugins: {
		dragData: true,
	} as any, // TODO: fix this later with proper TS typings
	animation: false,
};

export const simpleChartScenarioBase = {
	roundingPrecision: 2,
	configuration: {
		data: {
			labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
			datasets: [
				{
					label: "# of Votes",
					data: [12, 19, 3, 5, 2, 3],
					fill: true,
					tension: 0.4,
					borderWidth: 1,
					pointHitRadius: 25,
				},
				{
					label: "# of Points",
					data: [7, 11, 5, 8, 3, 7],
					fill: true,
					tension: 0.4,
					borderWidth: 1,
					pointHitRadius: 25,
				},
			],
		},
		options: {},
	},
	steps: [
		...testsConfig.TESTED_AXES.flatMap(
			(axisSpec) =>
				[
					...((testsConfig.ENABLED_INTERACTIONS.includes("standardDragging")
						? [
								{
									// dataset index 0 point index 0 -> dataset index 0 point index 1
									axisSpec,
									dragPointSpec: { datasetIndex: 0, index: 0 },
									dragDestPointSpecOrStartPointOffset: {
										datasetIndex: 0,
										index: 1,
									},
								},
								{
									// dataset index 0 point index 2 -> dataset index 0 point index 2
									axisSpec,
									dragPointSpec: { datasetIndex: 0, index: 2 },
									dragDestPointSpecOrStartPointOffset: {
										datasetIndex: 0,
										index: 2,
									},
								},
								{
									// dataset index 1 point index 3 -> dataset index 0 point index 4
									axisSpec,
									dragPointSpec: { datasetIndex: 1, index: 3 },
									dragDestPointSpecOrStartPointOffset: {
										datasetIndex: 0,
										index: 4,
									},
								},
								{
									// dataset index 1 point index 2 -> point position offset by +20px on x and +40.5px on y
									axisSpec,
									dragPointSpec: { datasetIndex: 1, index: 2 },
									dragDestPointSpecOrStartPointOffset: new Offset2D({
										x: 20,
										y: 40.5,
									}),
								},
							]
						: []) as TestScenario["steps"]),
					...((testsConfig.ENABLED_INTERACTIONS.includes(
						"draggingOutOfCanvasBoundsX",
					)
						? [
								{
									// dataset index 1 point index 3 -> -70% of the chart width on x (out of bounds of the chart to the left)
									axisSpec,
									dragPointSpec: { datasetIndex: 1, index: 2 },
									dragDestPointSpecOrStartPointOffset: new Offset2D({
										xRelative: -0.7,
										yRelative: 0,
									}),
								},
								{
									// dataset index 1 point index 3 -> +70% of the chart width on x (out of bounds of the chart to the right)
									axisSpec,
									dragPointSpec: { datasetIndex: 1, index: 2 },
									dragDestPointSpecOrStartPointOffset: new Offset2D({
										xRelative: 0.7,
										yRelative: 0,
									}),
								},
							]
						: []) as TestScenario["steps"]),
					...((testsConfig.ENABLED_INTERACTIONS.includes(
						"draggingOutOfCanvasBoundsY",
					)
						? []
						: []) as TestScenario["steps"]),
				] as TestScenario["steps"],
		),
	],
} satisfies TestScenario;

export const simpleCategoricalChartScenario = _.merge(
	{},
	simpleChartScenarioBase,
	{
		isCategoricalX: true,
	},
) satisfies TestScenario;

export const simpleLinearChartScenario = _.merge({}, simpleChartScenarioBase, {
	configuration: {
		data: {
			datasets: simpleChartScenarioBase.configuration.data.datasets.map(
				(dataset) => ({
					...dataset,
					data: dataset.data.map((value, index) => ({
						x: index,
						y: value,
					})),
				}),
			),
		},
		options: {
			scales: {
				x: {
					type: "linear",
				},
			},
		},
	},
} satisfies {
	configuration: DeepPartial<TestScenario["configuration"]>;
}) as TestScenario;

export type TestScenariosRegistry = Record<string, TestScenario>;

function postprocessScenariosRegistry(
	registry: TestScenariosRegistry,
): TestScenariosRegistry {
	return Object.fromEntries(
		Object.entries(registry).map(([fileName, scenario]) => {
			let originalScales = scenario.configuration.options?.scales ?? {
				x: {},
				y: {},
			};

			return [
				fileName,
				_.merge(scenario, {
					configuration: {
						options: {
							scales: _.reduce(
								originalScales,
								(obj, value, key) => {
									if (!scenario.configuration.data) return obj;

									const allValues =
										scenario.configuration.data.datasets.flatMap((dataset) =>
											dataset.data
												.filter((value) => value !== null)
												.map((value) =>
													typeof value === "number"
														? value
														: Array.isArray(value)
															? value[key === "x" ? 0 : 1]
															: key === "x"
																? value!.x
																: value!.y,
												),
										);

									if (key === "x" && scenario.configuration.data?.labels)
										return obj;

									// @ts-ignore
									obj[key] = {
										...value,
										min: Math.min(...allValues),
										max: Math.max(...allValues),
									} as DeepPartial<
										NonNullable<ChartConfiguration["options"]>["scales"]
									>;

									return obj;
								},
								{},
							) as any,
						},
					},
				} satisfies DeepPartial<TestScenario>) satisfies TestScenario,
			];
		}),
	);
}

export const TestScenarios = postprocessScenariosRegistry({
	/** "Simple" dataset scenarios */
	"line-categorical.html": simpleCategoricalChartScenario,
	"line-linear.html": simpleLinearChartScenario,
	// "bar.html": simpleCategoricalChartScenario,
	// "horizontalBar.html": simpleCategoricalChartScenario,
	// "polar.html": simpleCategoricalChartScenario,
	// "radar.html": simpleCategoricalChartScenario,
} satisfies TestScenariosRegistry);
