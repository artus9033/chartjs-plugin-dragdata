import type { ChartType } from "chart.js";
import { Chart } from "chart.js";

import ChartJSDragDataPlugin from "../plugin";
import {
	DragDataEvent,
	DragDataState,
	OptionalPluginConfiguration,
} from "../types";
import { checkDraggingConfiguration } from "../util/checkDraggingConfiguration";
import { calcCartesian, calcRadialLinear } from "./calc";
import { roundValue } from "./roundValue";

export function updateData<TType extends ChartType>(
	event: DragDataEvent,
	chartInstance: Chart<TType>,
	state: DragDataState | undefined = ChartJSDragDataPlugin.statesStore.get(
		chartInstance.id,
	),
) {
	if (!state) return;

	const pluginOptions = chartInstance.options?.plugins
		?.dragData as OptionalPluginConfiguration<TType>;

	const callback = pluginOptions?.onDrag;

	if (state.element) {
		state.curDatasetIndex = state.element.datasetIndex;
		state.curIndex = state.element.index;

		state.isDragging = true;

		let dataPoint =
			chartInstance.data.datasets[state.curDatasetIndex].data[state.curIndex]!;

		const draggingConfiguration = checkDraggingConfiguration(
			chartInstance,
			state.curDatasetIndex,
			state.curIndex,
		);

		if (state.type === "radar" || state.type === "polarArea") {
			dataPoint = calcRadialLinear(
				event,
				chartInstance,
				state.curIndex,
				state.rAxisID,
				state,
			);
		} else if (state.stacked) {
			let cursorPos = calcCartesian(
				event,
				chartInstance,
				dataPoint,
				draggingConfiguration,
				state,
			);
			dataPoint = roundValue(
				(cursorPos as number) - state.initValue,
				(pluginOptions as OptionalPluginConfiguration<TType>)?.round,
			);
		} else {
			dataPoint = calcCartesian(
				event,
				chartInstance,
				dataPoint,
				draggingConfiguration,
				state,
			);
		}

		if (
			typeof callback === "function"
				? callback(event, state.curDatasetIndex, state.curIndex, dataPoint) !==
					false
				: true
		) {
			chartInstance.data.datasets[state.curDatasetIndex].data[state.curIndex] =
				dataPoint;
			chartInstance.update("none");
		}
	}
}
