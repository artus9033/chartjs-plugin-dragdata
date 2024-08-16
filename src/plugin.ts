import { Chart, ChartType } from "chart.js";
import { drag } from "d3-drag";
import { select } from "d3-selection";

import { DragDataState, OptionalPluginConfiguration } from "./types";
import { dragEndCallback } from "./util/dragEndCallback";
import { getElement } from "./util/getElement";
import { updateData } from "./util/updateData";

const ChartJSDragDataPlugin = {
	id: "dragdata",
	statesStore: new Map<Chart["id"], DragDataState>(),
	afterInit: function dragDataAfterInit<TType extends ChartType>(
		chartInstance: Chart<TType>,
	) {
		const pluginOptions = chartInstance.config.options?.plugins
			?.dragData as OptionalPluginConfiguration<TType>;
		const state: DragDataState = {
			curIndex: undefined,
			curDatasetIndex: undefined,
			element: null,
			eventSettings: false,
			floatingBar: false,
			initValue: 0,
			xAxisID: "",
			yAxisID: "",
			rAxisID: "",
			stacked: false,
			type: undefined,
			isDragging: false,
		};

		ChartJSDragDataPlugin.statesStore.set(chartInstance.id, state);

		select(chartInstance.canvas).call(
			drag<HTMLCanvasElement, unknown>()
				.container(chartInstance.canvas)
				.on("start", (e) =>
					getElement(
						e.sourceEvent,
						chartInstance,
						pluginOptions?.onDragStart,
						state,
					),
				)
				.on("drag", (e) =>
					updateData(
						e.sourceEvent,
						chartInstance,
						pluginOptions,
						pluginOptions?.onDrag,
						state,
					),
				)
				.on("end", (e) =>
					dragEndCallback(
						e.sourceEvent,
						chartInstance,
						pluginOptions?.onDragEnd,
						state,
					),
				),
		);
	},
	beforeEvent: function dragDataBeforeEvent<TType extends ChartType>(
		chartInstance: Chart<TType>,
	) {
		let state = ChartJSDragDataPlugin.statesStore.get(chartInstance.id);

		if (state?.isDragging) {
			(chartInstance.tooltip as any | undefined)?.update();

			return false;
		}
	},
};

// TODO: in a future major release, stop auto-registering the plugin and require users to manually register it
// see https://chartjs-plugin-datalabels.netlify.app/guide/getting-started.html#registration
Chart.register(ChartJSDragDataPlugin);

export default ChartJSDragDataPlugin;
