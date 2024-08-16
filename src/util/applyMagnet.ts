import { Chart, ChartType } from "chart.js";

import { ChartDataItemType, OptionalPluginConfiguration } from "../types";

/**
 * Updates values to the nearest values
 * @param chartInstance the chart instance
 * @param datasetIndex the dataset index
 * @param index the data point index
 * @returns value after applying magnet or unchanged if not magnet is configured
 */
export function applyMagnet<TType extends ChartType>(
	chartInstance: Chart<TType>,
	datasetIndex: number,
	index: number,
): ChartDataItemType<TType> {
	const pluginOptions = (chartInstance as any as Chart<"bubble">).config.options
		?.plugins?.dragData as OptionalPluginConfiguration<TType>;

	if (pluginOptions?.magnet) {
		const magnet = pluginOptions?.magnet;

		if (typeof magnet.to === "function") {
			let data = chartInstance.data.datasets[datasetIndex].data[index];
			data = magnet.to(data);

			chartInstance.data.datasets[datasetIndex].data[index] = data;

			chartInstance.update("none");

			return data;
		}

		return null;
	} else {
		return chartInstance.data.datasets[datasetIndex].data[index];
	}
}
