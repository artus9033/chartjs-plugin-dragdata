import { ChartData, ChartOptions } from "chart.js";
import { TestScenario } from "../__utils__/scenario";

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

export const TestScenarios = {
	line: [
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
} satisfies Record<string, TestScenario>;
