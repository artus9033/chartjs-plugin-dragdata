import type { ChartType } from "chart.js";
import { Chart } from "chart.js";

import ChartJSDragDataPlugin from "../plugin";
import {
	DragDataEvent,
	DragDataState,
	OptionalPluginConfiguration,
} from "../types";
import { applyMagnet } from "./applyMagnet";

export function dragEndCallback<TType extends ChartType>(
	event: DragDataEvent,
	chartInstance: Chart<TType>,
	state: DragDataState | undefined = ChartJSDragDataPlugin.statesStore.get(
		chartInstance.id,
	),
) {
	if (!state) return;

	const callback = (
		chartInstance.options?.plugins
			?.dragData as OptionalPluginConfiguration<TType>
	)?.onDragEnd;

	state.curIndex = undefined;
	state.isDragging = false;

	// re-enable the tooltip animation
	if (chartInstance.config.options?.plugins?.tooltip) {
		chartInstance.config.options.plugins.tooltip.animation =
			state.eventSettings;
		chartInstance.update("none");
	}

	if (!state.element) {
		return;
	}

	const datasetIndex = state.element.datasetIndex;
	const index = state.element.index;
	const value = applyMagnet(chartInstance, datasetIndex, index);

	if (typeof callback === "function") {
		return callback(event, datasetIndex, index, value);
	}
}
