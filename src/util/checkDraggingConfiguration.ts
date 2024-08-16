import type { BubbleDataPoint, ChartType, Point } from "chart.js";
import { Chart } from "chart.js";

import ChartJSDragDataPlugin from "../plugin";
import { DragDataState } from "../types";
import { OptionalPluginConfiguration } from "../types/Configuration";

export type DraggingConfiguration = Record<
	| "chartDraggingDisabled"
	| "datasetDraggingDisabled"
	| "xAxisDraggingDisabled"
	| "yAxisDraggingDisabled"
	| "dataPointDraggingDisabled",
	boolean
>;

export type AxisDraggingConfiguration = Pick<
	DraggingConfiguration,
	"xAxisDraggingDisabled" | "yAxisDraggingDisabled"
>;

export function checkDraggingConfiguration<TType extends ChartType>(
	chartInstance: Chart<TType>,
	datasetIndex: number,
	dataPointIndex: number,
	state: DragDataState | undefined = ChartJSDragDataPlugin.statesStore.get(
		chartInstance.id,
	),
): DraggingConfiguration {
	if (!state)
		return {
			chartDraggingDisabled: true,
			datasetDraggingDisabled: true,
			xAxisDraggingDisabled: true,
			yAxisDraggingDisabled: true,
			dataPointDraggingDisabled: true,
		};

	const dataset = chartInstance.data.datasets[datasetIndex];

	/** per-chart option */
	const chartDraggingDisabled =
		chartInstance.config.options?.plugins?.dragData === false;

	/** per-dataset option */
	const datasetDraggingDisabled =
		chartDraggingDisabled || dataset.dragData === false;

	/** x-axis option (per-axis); dragging on the x-axis is disabled by default */
	const _xAxisDraggingPerAxisOptionValue =
		chartInstance.config.options?.scales?.[state.xAxisID]?.dragData;

	/** x-axis option (per-axis); dragging on the x-axis is disabled by default */
	let xAxisDraggingDisabled = true;

	if (
		!datasetDraggingDisabled &&
		(_xAxisDraggingPerAxisOptionValue === true || // finally, dragging can be enabled on the x-axis by the plugin options,
			// unless it's explicitly disabled in x-axis options
			((
				chartInstance.config.options?.plugins
					?.dragData as OptionalPluginConfiguration<TType>
			)?.dragX === true &&
				_xAxisDraggingPerAxisOptionValue !== false))
	) {
		xAxisDraggingDisabled = false;
	}

	/** y-axis option (per-axis); dragging on the y-axis is enabled by default */
	const yAxisDraggingDisabled =
		datasetDraggingDisabled ||
		(
			chartInstance.config.options?.plugins
				?.dragData as OptionalPluginConfiguration<TType>
		)?.dragY === false ||
		chartInstance.config.options?.scales?.[state.yAxisID]?.dragData === false;

	/** per-data-point option */
	const dataPointDraggingDisabled =
		datasetDraggingDisabled ||
		(dataset.data[dataPointIndex] as Point | BubbleDataPoint)?.dragData ===
			false;

	return {
		chartDraggingDisabled,
		datasetDraggingDisabled,
		xAxisDraggingDisabled,
		yAxisDraggingDisabled,
		dataPointDraggingDisabled,
	};
}
