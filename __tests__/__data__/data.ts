import { ChartData, ChartOptions } from "chart.js";
import _ from "lodash";
import { TestScenario } from "../__utils__/scenario";
import { DeepPartial } from "chart.js/dist/types/utils";

export const data: ChartData = {
	labels: ["January", "February", "March", "April", "May", "June", "July"],
	datasets: [
		{
			label: "My First dataset",
			backgroundColor: "rgba(255,99,132,0.2)",
			borderColor: "rgba(255,99,132,1)",
			borderWidth: 1,
			hoverBackgroundColor: "rgba(255,99,132,0.4)",
			hoverBorderColor: "rgba(255,99,132,1)",
			data: [65, 59, 80, 81, 56, 55, 40],
		},
	],
};

export const TestChartOptions: ChartOptions = {
	plugins: {
		dragData: true,
	} as any, // TODO: fix this later with proper TS typings
	animation: false,
};

const simpleChartScenarioBase = {
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
		{
			axisSpec: "y",
			dragPointSpec: { datasetIndex: 0, index: 0 },
			destRefPointOrSpec: { datasetIndex: 0, index: 1 },
		},
		{
			axisSpec: "y",
			dragPointSpec: { datasetIndex: 0, index: 0 },
			destRefPointOrSpec: { datasetIndex: 0, index: 2 },
		},
		{
			axisSpec: "y",
			dragPointSpec: { datasetIndex: 1, index: 0 },
			destRefPointOrSpec: { datasetIndex: 0, index: 4 },
		},
		// {
		// 	axisSpec: "x",
		// 	dragPointSpec: { datasetIndex: 0, index: 0 },
		// 	destRefPointOrSpec: { datasetIndex: 0, index: 1 },
		// },
		// {
		// 	axisSpec: "x",
		// 	dragPointSpec: { datasetIndex: 0, index: 0 },
		// 	destRefPointOrSpec: { datasetIndex: 0, index: 2 },
		// },
		// {
		// 	axisSpec: "x",
		// 	dragPointSpec: { datasetIndex: 1, index: 0 },
		// 	destRefPointOrSpec: { datasetIndex: 0, index: 4 },
		// },
	],
} satisfies TestScenario;

const simpleCategoricalChartScenario = _.merge(
	{},
	{
		...simpleChartScenarioBase,
	},
) as TestScenario;

const simpleLinearChartScenario = _.merge(
	{},
	{
		...simpleChartScenarioBase,
	},
	{
		configuration: {
			data: {
				datasets: simpleChartScenarioBase.configuration.data.datasets.map(
					(dataset) => ({
						...dataset,
						data: dataset.data.map((value, index) => ({
							x: index + 1.5,
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
	},
) as TestScenario;

export const TestScenarios = {
	/** "Simple" dataset scenarios */
	"line-categorical.html": simpleCategoricalChartScenario,
	"line-linear.html": simpleLinearChartScenario,
	"bar.html": simpleCategoricalChartScenario,
	"horizontalBar.html": simpleCategoricalChartScenario,
	"polar.html": simpleCategoricalChartScenario,
	"radar.html": simpleCategoricalChartScenario,
} satisfies Record<string, TestScenario>;
