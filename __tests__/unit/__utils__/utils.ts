import { Chart, ChartTypeRegistry } from "chart.js";

import { TestChartOptions, data } from "../../__data__/data";

export function setupChartInstance(chartType: keyof ChartTypeRegistry) {
	const canvas = document.createElement("canvas");
	canvas.width = 800;
	canvas.height = 400;
	canvas.style.width = "800px";
	canvas.style.height = "400px";
	var ctx = canvas.getContext("2d")!;

	return new Chart<typeof chartType>(ctx, {
		type: chartType,
		data,
		options: TestChartOptions,
	});
}
