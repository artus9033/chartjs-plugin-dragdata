import { TestScenario } from "../__utils__/structures/scenario";
import { E2EInteraction } from "../__utils__/testsConfig";

export const scatterChartScenario = {
	configuration: {
		type: "scatter",
		data: {
			datasets: [
				{
					label: "A dataset",
					data: [
						{
							x: 0,
							y: -49,
						},
						{
							x: 10,
							y: -54,
						},
						{
							x: 20,
							y: -48,
						},
						{
							x: 30,
							y: -42.9,
						},
						{
							x: 40,
							y: 46,
						},
						{
							x: 50,
							y: 44,
						},
						{
							x: 60,
							y: -76,
						},
						{
							x: 70,
							y: 78,
						},
						{
							x: 80,
							y: 34,
						},
						{
							x: 90,
							y: 49,
						},
					],
					backgroundColor: "rgba(255, 99, 132, 1)",
					borderWidth: 2.5,
					fill: false,
					pointRadius: 10,
					pointHitRadius: 25,
					showLine: true,
				},
			],
		},
		options: {
			layout: {
				padding: {
					left: 20,
					right: 20,
					top: 20,
					bottom: 10,
				},
			},
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	},
	roundingPrecision: 4,
	isCategoricalX: true,
	isCategoricalY: false,
	// too complex to test in E2E, at least for now
	stepGroups: [],
	skipE2ETesting: true,
} satisfies TestScenario<E2EInteraction>;
