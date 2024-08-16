import type {
	CartesianScaleOptions,
	ChartConfiguration,
	ChartType,
} from "chart.js";
import { Chart } from "chart.js";

import ChartJSDragDataPlugin from "../plugin";
import {
	DragDataEvent,
	DragDataState,
	DragEventCallback,
	OptionalPluginConfiguration,
} from "../types";
import { checkDraggingConfiguration } from "../util/checkDraggingConfiguration";
import { calcCartesian } from "./calc";

export function getElement<TType extends ChartType>(
	event: DragDataEvent,
	chartInstance: Chart<TType>,
	callback?: DragEventCallback<TType>,
	state: DragDataState | undefined = ChartJSDragDataPlugin.statesStore.get(
		chartInstance.id,
	),
) {
	if (!state) return;

	const searchMode =
			chartInstance.config.options?.interaction?.mode ?? "nearest",
		searchOptions = chartInstance.config.options?.interaction ?? {
			intersect: true,
		};

	state.element = chartInstance.getElementsAtEventForMode(
		event,
		searchMode,
		searchOptions,
		false,
	)[0];

	if (state.element) {
		let datasetIndex = state.element.datasetIndex;
		let index = state.element.index;

		// note: type may be absent if config is ChartConfigurationCustomTypesPerDataset, in which case we pull this value from the dataset
		state.type =
			(chartInstance.config as ChartConfiguration<TType>).type ??
			chartInstance.data.datasets[datasetIndex].type ??
			undefined;

		// save element settings
		state.eventSettings =
			chartInstance.config.options?.plugins?.tooltip?.animation;

		const dataset = chartInstance.data.datasets[datasetIndex];
		const datasetMeta = chartInstance.getDatasetMeta(datasetIndex);
		let curValue = dataset.data[index];
		// get the id of the datasets scale
		state.xAxisID = datasetMeta.xAxisID!;
		state.yAxisID = datasetMeta.yAxisID!;
		state.rAxisID = datasetMeta.rAxisID!;

		const draggingConfiguration = checkDraggingConfiguration(
				chartInstance,
				datasetIndex,
				index,
			),
			{
				datasetDraggingDisabled,
				xAxisDraggingDisabled,
				yAxisDraggingDisabled,
				dataPointDraggingDisabled,
			} = draggingConfiguration;

		// check if dragging the dataset or datapoint is prohibited
		if (
			datasetDraggingDisabled ||
			// dragging disabled on all scales
			(xAxisDraggingDisabled && yAxisDraggingDisabled) ||
			dataPointDraggingDisabled
		) {
			state.element = null;
			return;
		}

		if (state.type === "bar") {
			// note: stacked may be missing in RadialLinearScaleOptions
			state.stacked =
				(
					chartInstance.config.options?.scales?.[
						state.xAxisID
					] as CartesianScaleOptions
				)?.stacked ?? undefined;

			// if a bar has a data point that is an array of length 2, it's a floating bar
			const samplePoint = chartInstance.data.datasets[0].data[0];
			state.floatingBar =
				samplePoint !== null &&
				Array.isArray(samplePoint) &&
				samplePoint.length >= 2;

			let dataPoint = chartInstance.data.datasets[datasetIndex].data[index]!;
			let newPos = calcCartesian(
				event,
				chartInstance,
				dataPoint,
				draggingConfiguration,
				state,
			);
			state.initValue = (newPos as number) - (curValue as number);
		}

		// disable the tooltip animation
		const showTooltipOptionValue = (
			chartInstance.config.options?.plugins
				?.dragData as OptionalPluginConfiguration<TType>
		)?.showTooltip;
		if (
			showTooltipOptionValue === undefined ||
			showTooltipOptionValue === true
		) {
			chartInstance.config.options ??= {} as any;
			chartInstance.config.options!.plugins ??= {} as any;
			chartInstance.config.options!.plugins!.tooltip ??= {} as any;

			chartInstance.config.options!.plugins!.tooltip!.animation = false;
		}

		if (typeof callback === "function" && state.element) {
			if (callback(event, datasetIndex, index, curValue) === false) {
				state.element = null;
			}
		}
	}
}
