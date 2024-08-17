import type { ChartType } from "chart.js";
import { Chart } from "chart.js";

import ChartJSDragDataPlugin from "../plugin";
import { DragDataEvent, DragDataState, DragEventCallback } from "../types";
import { applyMagnet } from "./applyMagnet";

export function dragEndCallback<TType extends ChartType>(
	event: DragDataEvent,
	chartInstance: Chart<TType>,
	callback?: DragEventCallback<TType>,
	state: DragDataState | undefined = ChartJSDragDataPlugin.statesStore.get(
		chartInstance.id,
	),
) {
	if (!state) return;

	state.curIndex = undefined;
	state.isDragging = false;

	// re-enable the tooltip animation
	if (chartInstance.config.options?.plugins?.tooltip) {
		chartInstance.config.options.plugins.tooltip.animation =
			state.eventSettings;
		chartInstance.update("none");
	}

	if (typeof callback === "function" && state.element) {
		const datasetIndex = state.element.datasetIndex;
		const index = state.element.index;

		let value = applyMagnet(chartInstance, datasetIndex, index);

		return callback(event, datasetIndex, index, value);
	}
}
