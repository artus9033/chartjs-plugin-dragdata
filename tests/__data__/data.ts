import "chartjs-plugin-datalabels";
import { ChartConfiguration, ChartOptions } from "chart.js";
import _ from "lodash";
import {
	TestScenario,
	TestScenarioStepsGroup,
	TestScenarioStep,
} from "../__utils__/structures/scenario";
import testsConfig, {
	E2EInteraction,
	isTestsConfigWhitelistItemAllowed,
} from "../__utils__/testsConfig";
import Offset2D from "../__utils__/structures/Offset2D";
import { ALL_AXES_SPECS, AxisSpec } from "../__utils__/structures/axisSpec";
import { BAR_SAFETY_HIT_MARGIN } from "../e2e/__utils__/constants";
import { DeepPartial } from "../__utils__/types";
import { ganttChartScenario } from "./gantt";
import { scatterChartScenario } from "./scatter";

export const TestChartOptions: ChartOptions = {
	plugins: {
		dragData: true,
	} as any, // TODO: fix this later with proper TS typings
	animation: false,
};

function mergeScenarioPartialConfigurations(
	...partials: Array<DeepPartial<TestScenario<E2EInteraction>>>
): TestScenario<E2EInteraction> {
	const [object, ...other] = partials;

	return _.merge(object, ...other) as TestScenario<E2EInteraction>;
}

function conditionallySkipInteractionForGroupOfSteps(
	category: E2EInteraction,
	steps: Array<TestScenarioStep>,
	shouldAssertScreenshot: boolean,
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
		shouldAssertScreenshot,
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

export const genericChartScenarioBase = _.merge(
	_.cloneDeep(commonChartScenarioBase),
	{
		configuration: {
			options: {
				plugins: {
					datalabels: { display: false },
				},
			},
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
		stepGroups: ALL_AXES_SPECS.flatMap((axisSpec) => {
			const shouldAssertScreenshot = axisSpec === "both";

			return [
				conditionallySkipInteractionForGroupOfSteps(
					"standardDragging",
					[
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
								xAbs: 0.8, // in chart-value units
								yAbs: 1.25, // in chart-value units
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
									xAbs: -0.1, // in chart-value units
									yAbs: 0.1, // in chart-value units
								}),
							},
						},
						{
							// dataset index 1 point index 2 -> point position offset by +0.18 of a single unit on x and +0.5 of a single unit on y
							axisSpec,
							dragPointSpec: { datasetIndex: 1, index: 2 },
							dragDestPointSpecOrStartPointOffset: new Offset2D({
								xAbs: 0.18, // in chart-value units
								yAbs: 0.5, // in chart-value units
							}),
						},
					],
					shouldAssertScreenshot,
				),
				...(axisSpec === "both"
					? [
							conditionallySkipInteractionForGroupOfSteps(
								"draggingToCanvasBoundsX",
								[
									{
										// dataset index 0 point index 2 -> -150% (up to this value, clipped to window size in drag fixture) of the chart width on x (to the bounds of the chart to the left)
										axisSpec,
										dragPointSpec: { datasetIndex: 0, index: 2 },
										dragDestPointSpecOrStartPointOffset: new Offset2D({
											xRelative: -1.5,
											yRelative: 0,
										}),
									},
									{
										// dataset index 0 point index 3 -> +150% (up to this value, clipped to window size in drag fixture) of the chart width on x (to the bounds of the chart to the right)
										axisSpec,
										dragPointSpec: { datasetIndex: 0, index: 3 },
										dragDestPointSpecOrStartPointOffset: new Offset2D({
											xRelative: 1.5,
											yRelative: 0,
										}),
									},
								],
								shouldAssertScreenshot,
							),
							conditionallySkipInteractionForGroupOfSteps(
								"draggingToCanvasBoundsY",
								[
									{
										// dataset index 0 point index 2 -> -150% (up to this value, clipped to window size in drag fixture) of the chart height on y (to the bounds of the chart to the top)
										axisSpec,
										dragPointSpec: { datasetIndex: 0, index: 2 },
										dragDestPointSpecOrStartPointOffset: new Offset2D({
											xRelative: 0,
											yRelative: -1.5,
										}),
									},
									{
										// dataset index 0 point index 3 -> +150% (up to this value, clipped to window size in drag fixture) of the chart height on y (to the bounds of the chart to the bottom)
										axisSpec,
										dragPointSpec: { datasetIndex: 0, index: 3 },
										dragDestPointSpecOrStartPointOffset: new Offset2D({
											xRelative: 0,
											yRelative: 1.5,
										}),
									},
								],
								shouldAssertScreenshot,
							),
						]
					: []),
			].map(generateStepGroupConfigurationApplicator(axisSpec));
		}),
	} satisfies Partial<TestScenario<E2EInteraction>>,
);

export const categoricalLineChartScenario = mergeScenarioPartialConfigurations(
	{ configuration: { type: "line" } },
	genericChartScenarioBase,
	{
		isCategoricalX: true,
		isCategoricalY: false,
	},
) satisfies TestScenario<E2EInteraction>;

export const linearLineChartScenarioBase = {
	configuration: {
		data: {
			datasets: genericChartScenarioBase.configuration.data.datasets.map(
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
} satisfies Partial<TestScenario<E2EInteraction>>;

export const linearLineChartScenario = mergeScenarioPartialConfigurations(
	{ configuration: { type: "line" } },
	_.cloneDeep(genericChartScenarioBase),
	linearLineChartScenarioBase,
) as TestScenario<E2EInteraction>;

export const barChartScenarioBase = {
	configuration: { type: "bar" },
} satisfies Partial<TestScenario<E2EInteraction>>;

export const standardBarChartScenarioBase = {
	...genericChartScenarioBase,
	stepGroups: genericChartScenarioBase.stepGroups.map((group) => ({
		...group,
		steps: group.steps.map((step) => ({
			...step,
			dragPointSpec: {
				...step.dragPointSpec,
				additionalOffset: (
					step.dragPointSpec.additionalOffset ??
					new Offset2D({ xAbs: 0, yAbs: 0, shouldBeLogged: false })
				).summedCopy(
					// since the bar chart does not support hit radius extension, we need to be precise
					// and as testing is not perfectly precise, we want a safety margin: we start
					// dragging from a bit lower than the edge to make sure we hit the bar
					new Offset2D({
						yAbs: -BAR_SAFETY_HIT_MARGIN,
						scalable: false,
						shouldBeLogged: false,
					}),
				),
			},
		})),
	})),
} satisfies Partial<TestScenario<E2EInteraction>>;

export const barChartScenario = mergeScenarioPartialConfigurations(
	_.cloneDeep(genericChartScenarioBase),
	barChartScenarioBase,
	standardBarChartScenarioBase,
	{
		isCategoricalX: true,
		isCategoricalY: false,
	},
) as TestScenario<E2EInteraction>;

export const horizontalBarChartScenario = mergeScenarioPartialConfigurations(
	_.cloneDeep(genericChartScenarioBase),
	barChartScenarioBase,
	{
		stepGroups: standardBarChartScenarioBase.stepGroups.map((group) => ({
			...group,
			steps: group.steps.map((step) => ({
				...step,
				dragPointSpec: {
					...step.dragPointSpec,
					additionalOffset: (
						step.dragPointSpec.additionalOffset ??
						new Offset2D({ xAbs: 0, yAbs: 0, shouldBeLogged: false })
					).summedCopy(
						// since the bar chart does not support hit radius extension, we need to be precise
						// and as testing is not perfectly precise, we want a safety margin: we start
						// dragging from a bit lower than the edge to make sure we hit the bar
						new Offset2D({
							xAbs: BAR_SAFETY_HIT_MARGIN,
							scalable: false,
							shouldBeLogged: false,
						}),
					),
				},
			})),
		})),
	},
	{
		configuration: {
			options: {
				indexAxis: "y",
			},
		},
	},
	{
		isCategoricalX: false,
		isCategoricalY: true,
	},
) as TestScenario<E2EInteraction>;

export const polarChartScenarioBase = {
	configuration: { type: "polarArea" },
} satisfies Partial<TestScenario<E2EInteraction>>;

export const polarChartScenario = mergeScenarioPartialConfigurations(
	_.cloneDeep(genericChartScenarioBase),
	polarChartScenarioBase,
	{
		// too complex to test in E2E, at least for now
		stepGroups: [],
		skipE2ETesting: true,
	},
) as TestScenario<E2EInteraction>;

export const radarChartScenarioBase = {
	configuration: { type: "radar" },
} satisfies Partial<TestScenario<E2EInteraction>>;

export const radarChartScenario = mergeScenarioPartialConfigurations(
	_.cloneDeep(genericChartScenarioBase),
	radarChartScenarioBase,
	{
		// too complex to test in E2E, at least for now
		stepGroups: [],
		skipE2ETesting: true,
	},
) as TestScenario<E2EInteraction>;

export const bubbleChartScenarioBase = {
	configuration: {
		type: "bubble",

		data: {
			labels: ["Red"],
			datasets: [
				{
					label: "Bubble",
					data: [
						{
							x: 10,
							y: 15,
							r: 30,
						},
					],
					borderWidth: 1,
					backgroundColor: "rgb(189, 80, 105, 1)",
					pointHitRadius: 25,
				},
			],
		},
		options: {
			scales: {
				y: {
					max: 25,
					min: 0,
				},
				x: {
					max: 11,
					min: 9,
				},
			},
		},
	},
} satisfies Partial<TestScenario<E2EInteraction>>;

export const bubbleChartScenario = mergeScenarioPartialConfigurations(
	_.cloneDeep(genericChartScenarioBase),
	bubbleChartScenarioBase,
	{
		// too complex to test in E2E, at least for now
		stepGroups: [],
		skipE2ETesting: true,
	},
) as TestScenario<E2EInteraction>;

export const bubbleXOnlyChartScenario = mergeScenarioPartialConfigurations(
	_.cloneDeep(genericChartScenarioBase),
	bubbleChartScenarioBase,
	{
		// too complex to test in E2E, at least for now
		stepGroups: [],
		skipE2ETesting: true,
		configuration: {
			options: {
				plugins: {
					// TODO: fix this later with proper TS typings
					// @ts-ignore
					dragData: {
						dragY: false, // only allow X axis to be draggable
					},
				},
			},
		},
	},
) as TestScenario<E2EInteraction>;

export const dualYAxisLineChartScenario = mergeScenarioPartialConfigurations(
	{ configuration: { type: "line" } },
	_.cloneDeep(genericChartScenarioBase),
	linearLineChartScenarioBase,
	{
		configuration: {
			data: {
				datasets: linearLineChartScenarioBase.configuration.data.datasets.map(
					(dataset, index) =>
						index === 0
							? dataset
							: {
									...dataset,
									data: dataset.data.map((value) => ({
										...value,
										y: value.y * 7.5,
									})),
								},
				),
			},
			options: {
				scales: {
					y: {
						type: "linear",
						position: "left",
						max: 85,
						min: 0,
					},
					y2: {
						type: "linear",
						position: "right",
						max: 1,
						min: 0,
					},
				},
			},
		},
	},
	{
		// too complex to test in E2E, at least for now
		stepGroups: [],
		skipE2ETesting: true,
	},
) as TestScenario<E2EInteraction>;

export const floatingBarChartScenarioBase = {
	configuration: {
		data: {
			datasets: standardBarChartScenarioBase.configuration.data.datasets.map(
				(dataset) => ({
					...dataset,
					data: dataset.data.map((value) => {
						// convert each value to a range from itself - 50% to itself + 50%

						const half = 0.5 * value;
						return [value - half, value + half];
					}),
				}),
			) as any,
		},
	},
} satisfies Partial<TestScenario<E2EInteraction>>;

export const floatingBarChartScenario = mergeScenarioPartialConfigurations(
	_.cloneDeep(barChartScenarioBase),
	standardBarChartScenarioBase,
	floatingBarChartScenarioBase,
	{
		// too complex to test in E2E, at least for now
		stepGroups: [],
		skipE2ETesting: true,
	},
) as TestScenario<E2EInteraction>;

export const horizontalFloatingBarChartScenario =
	mergeScenarioPartialConfigurations(
		_.cloneDeep(barChartScenarioBase),
		standardBarChartScenarioBase,
		floatingBarChartScenarioBase,
		{
			configuration: {
				options: {
					indexAxis: "y",
				},
			},
		},
		{
			isCategoricalX: false,
			isCategoricalY: true,
		},
		{
			// too complex to test in E2E, at least for now
			stepGroups: [],
			skipE2ETesting: true,
		},
	) as TestScenario<E2EInteraction>;

export const stackedBarChartScenarioBase = {
	configuration: {
		options: {
			scales: {
				x: {
					stacked: true,
				},
				y: {
					stacked: true,
				},
			},
		},
	},
} satisfies Partial<TestScenario<E2EInteraction>>;

export const stackedBarChartScenario = mergeScenarioPartialConfigurations(
	_.cloneDeep(barChartScenarioBase),
	standardBarChartScenarioBase,
	stackedBarChartScenarioBase,
	{
		isCategoricalX: true,
		isCategoricalY: false,
	},
	{
		// too complex to test in E2E, at least for now
		stepGroups: [],
		skipE2ETesting: true,
	},
) as TestScenario<E2EInteraction>;

export const stackedHorizontalBarChartScenario =
	mergeScenarioPartialConfigurations(
		_.cloneDeep(barChartScenarioBase),
		standardBarChartScenarioBase,
		stackedBarChartScenarioBase,
		{
			configuration: {
				options: {
					indexAxis: "y",
				},
			},
		},
		{
			isCategoricalX: false,
			isCategoricalY: true,
		},
		{
			// too complex to test in E2E, at least for now
			stepGroups: [],
			skipE2ETesting: true,
		},
	) as TestScenario<E2EInteraction>;

export type TestScenariosRegistry<
	bSealed extends boolean = false,
	keys extends string | number | symbol = string,
> = Record<keys, TestScenario<E2EInteraction, bSealed>>;

function postprocessScenariosRegistry<
	SpecializedRegistry extends TestScenariosRegistry<false>,
>(
	registry: SpecializedRegistry,
): TestScenariosRegistry<true, keyof SpecializedRegistry> {
	return Object.fromEntries(
		Object.entries(registry).map(([fileName, scenario]) => {
			let originalScales = _.merge(
				_.cloneDeep(scenario.configuration.options?.scales),
				{
					x: {},
					y: {},
				},
			);

			return [
				fileName,
				_.merge(scenario, {
					...(scenario.postprocessConfiguration === false
						? {}
						: {
								configuration: {
									options: {
										scales: _.reduce(
											originalScales,
											(obj, value, key) => {
												if (!scenario.configuration.data) return obj;

												if (
													(key === "x" && scenario.isCategoricalX) ||
													(key === "y" && scenario.isCategoricalY)
												)
													return obj;

												const allValues =
													scenario.configuration.data.datasets.flatMap(
														(dataset) =>
															dataset.data
																.filter((value) => value !== null)
																.flatMap((value) =>
																	typeof value === "number"
																		? value
																		: Array.isArray(value)
																			? value
																			: key === "x"
																				? value!.x
																				: value!.y,
																),
													);

												let min = Math.min(...allValues),
													max = Math.max(...allValues);

												if (min === max) {
													// handle an edge case, when there is only one data sample
													min = 0.5 * min;
													max = 1.5 * max;
												}

												// @ts-ignore
												obj[key] = {
													...value,
													min: originalScales[key]?.min ?? min,
													max: originalScales[key]?.max ?? max,
												} as DeepPartial<
													NonNullable<ChartConfiguration["options"]>["scales"]
												>;

												return obj;
											},
											{},
										) as any,
									},
								},
							}),
					onDrag: scenario.onDrag + "", // stringify the function for eval on page side
				} satisfies DeepPartial<
					TestScenario<E2EInteraction, true>
				>) satisfies TestScenario<E2EInteraction, true>,
			];
		}),
	) as TestScenariosRegistry<true> & SpecializedRegistry;
}

export const TestScenarios = postprocessScenariosRegistry({
	/** "Standard" dataset scenarios */
	"line-categorical.html": categoricalLineChartScenario,
	"line-linear.html": linearLineChartScenario,
	"line-dual-y-axis.html": dualYAxisLineChartScenario,
	"bar.html": barChartScenario,
	"bar-horizontal.html": horizontalBarChartScenario,
	"bar-floating.html": floatingBarChartScenario,
	"bar-floating-horizontal.html": horizontalFloatingBarChartScenario,
	"bar-stacked.html": stackedBarChartScenario,
	"bar-stacked-horizontal.html": stackedHorizontalBarChartScenario,
	"polar.html": polarChartScenario,
	"radar.html": radarChartScenario,
	"bubble.html": bubbleChartScenario,
	"bubble-x-only.html": bubbleXOnlyChartScenario,
	"gantt.html": ganttChartScenario,
	"scatter.html": scatterChartScenario,
}) satisfies TestScenariosRegistry<true>;
