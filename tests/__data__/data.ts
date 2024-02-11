import { ChartConfiguration, ChartOptions } from "chart.js";
import _ from "lodash";
import {
	TestScenario,
	TestScenarioStepsGroup,
	TestScenarioStep,
} from "../__utils__/structures/scenario";
import { DeepPartial } from "chart.js/dist/types/utils";
import testsConfig, {
	E2EInteraction,
	isTestsConfigWhitelistItemAllowed,
} from "../__utils__/testsConfig";
import Offset2D from "../__utils__/structures/Offset2D";
import { ALL_AXES_SPECS, AxisSpec } from "../__utils__/structures/axisSpec";

export const TestChartOptions: ChartOptions = {
	plugins: {
		dragData: true,
	} as any, // TODO: fix this later with proper TS typings
	animation: false,
};

function conditionallySkipInteractionForGroupOfSteps(
	category: E2EInteraction,
	steps: Array<TestScenarioStep>,
): TestScenarioStepsGroup<E2EInteraction> {
	let isInteractionAllowed = isTestsConfigWhitelistItemAllowed(
		"e2e",
		"whitelistedInteractions",
		category,
	);

	return {
		groupName: category,
		steps,
		shouldBeSkipped: !isInteractionAllowed,
	};
}

function generateStepGroupConfigurationApplicator(axisSpec: AxisSpec) {
	return (group: TestScenarioStepsGroup<E2EInteraction>) => ({
		...group,
		shouldBeSkipped: testsConfig.e2e.testedAxes.includes(axisSpec)
			? group.shouldBeSkipped
			: true,
	});
}

export const commonChartScenarioBase = {
	roundingPrecision: 4,
	configuration: {
		options: {},
	},
} satisfies Partial<TestScenario<E2EInteraction>>;

export const simpleChartScenarioBase = _.merge({}, commonChartScenarioBase, {
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
	},
	stepGroups: ALL_AXES_SPECS.flatMap((axisSpec) =>
		[
			conditionallySkipInteractionForGroupOfSteps("standardDragging", [
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
					// dataset index 0 point index 2 -> point position offset by +0.8 of a single unit on x and +1.25 of a single unit on y
					// tests moving to that point's coordinates themselves, asserts that the position is not modified (except for the magnet, if applicable)
					axisSpec,
					dragPointSpec: { datasetIndex: 0, index: 2 },
					dragDestPointSpecOrStartPointOffset: new Offset2D({
						x: 0.8, // in chart-value units
						y: 1.25, // in chart-value units
					}),
				},
				{
					// dataset index 0 point index 2 -> dataset index 0 point index 2
					// tests moving to that point's coordinates themselves, asserts that the position is not modified (except for the magnet, if applicable)
					axisSpec,
					dragPointSpec: { datasetIndex: 0, index: 2 },
					dragDestPointSpecOrStartPointOffset: {
						datasetIndex: 0,
						index: 2,
					},
				},
				{
					// dataset index 1 point index 3 -> dataset index 0 point index 3 offset by -0.1 of a single unit on x and +0.1 of a single unit on y
					axisSpec,
					dragPointSpec: { datasetIndex: 1, index: 3 },
					dragDestPointSpecOrStartPointOffset: {
						datasetIndex: 0,
						index: 3,
						additionalOffset: new Offset2D({
							x: -0.1, // in chart-value units
							y: 0.1, // in chart-value units
						}),
					},
				},
				{
					// dataset index 1 point index 2 -> point position offset by +0.18 of a single unit on x and +0.5 of a single unit on y
					axisSpec,
					dragPointSpec: { datasetIndex: 1, index: 2 },
					dragDestPointSpecOrStartPointOffset: new Offset2D({
						x: 0.18, // in chart-value units
						y: 0.5, // in chart-value units
					}),
				},
			]),
			conditionallySkipInteractionForGroupOfSteps(
				"draggingOutOfCanvasBoundsX",
				[
					{
						// dataset index 1 point index 2 -> -150% (up to this value, clipped to window size in drag fixture) of the chart width on x (out of bounds of the chart to the left)
						axisSpec,
						dragPointSpec: { datasetIndex: 1, index: 2 },
						dragDestPointSpecOrStartPointOffset: new Offset2D({
							xRelative: -1.5,
							yRelative: 0,
						}),
					},
					{
						// dataset index 1 point index 3 -> +150% (up to this value, clipped to window size in drag fixture) of the chart width on x (out of bounds of the chart to the right)
						axisSpec,
						dragPointSpec: { datasetIndex: 1, index: 3 },
						dragDestPointSpecOrStartPointOffset: new Offset2D({
							xRelative: 1.5,
							yRelative: 0,
						}),
					},
				],
			),
			conditionallySkipInteractionForGroupOfSteps(
				"draggingOutOfCanvasBoundsY",
				[
					{
						// dataset index 1 point index 2 -> -150% (up to this value, clipped to window size in drag fixture) of the chart height on y (out of bounds of the chart to the top)
						axisSpec,
						dragPointSpec: { datasetIndex: 1, index: 2 },
						dragDestPointSpecOrStartPointOffset: new Offset2D({
							xRelative: 0,
							yRelative: -1.5,
						}),
					},
					{
						// dataset index 1 point index 3 -> +150% (up to this value, clipped to window size in drag fixture) of the chart height on y (out of bounds of the chart to the bottom)
						axisSpec,
						dragPointSpec: { datasetIndex: 1, index: 3 },
						dragDestPointSpecOrStartPointOffset: new Offset2D({
							xRelative: 0,
							yRelative: 1.5,
						}),
					},
				],
			),
		].map(generateStepGroupConfigurationApplicator(axisSpec)),
	),
} satisfies Partial<TestScenario<E2EInteraction>>);

export const simpleCategoricalChartScenario = _.merge(
	{},
	simpleChartScenarioBase,
	{
		isCategoricalX: true,
		isCategoricalY: false,
	},
) satisfies TestScenario<E2EInteraction>;

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
	configuration: DeepPartial<TestScenario<E2EInteraction>["configuration"]>;
}) as TestScenario<E2EInteraction>;

export type TestScenariosRegistry = Record<
	string,
	TestScenario<E2EInteraction>
>;

function postprocessScenariosRegistry<
	SpecializedRegistry extends TestScenariosRegistry,
>(registry: SpecializedRegistry): SpecializedRegistry {
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

									if (key === "x" && scenario.configuration.data?.labels)
										return obj;

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
				} satisfies DeepPartial<
					TestScenario<E2EInteraction>
				>) satisfies TestScenario<E2EInteraction>,
			];
		}),
	) as SpecializedRegistry;
}

export const TestScenarios = postprocessScenariosRegistry({
	/** "Simple" dataset scenarios */
	"line-categorical.html": simpleCategoricalChartScenario,
	"line-linear.html": simpleLinearChartScenario,
	"bar.html": simpleCategoricalChartScenario,
	// "horizontalBar.html": simpleCategoricalChartScenario,
	// "polar.html": simpleCategoricalChartScenario,
	// "radar.html": simpleCategoricalChartScenario,
}) satisfies TestScenariosRegistry;
