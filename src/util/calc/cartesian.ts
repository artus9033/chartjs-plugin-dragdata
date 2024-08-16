import type { ChartType, Point } from "chart.js";
import { Chart } from "chart.js";

import ChartJSDragDataPlugin from "../../plugin";
import {
	ChartDataItemType,
	DragDataEvent,
	DragDataState,
	OptionalPluginConfiguration,
} from "../../types";
import { AxisDraggingConfiguration } from "../../types/DraggingConfiguration";
import { cloneDataPoint } from "../cloneDataPoint";
import { roundValue } from "../roundValue";

export function calcCartesian<TType extends ChartType>(
	event: DragDataEvent,
	chartInstance: Chart<TType>,
	data: NonNullable<ChartDataItemType<TType>>,
	{ xAxisDraggingDisabled, yAxisDraggingDisabled }: AxisDraggingConfiguration,
	state: DragDataState | undefined = ChartJSDragDataPlugin.statesStore.get(
		chartInstance.id,
	),
): NonNullable<ChartDataItemType<ChartType>> {
	if (!state) return data;

	let x, y;
	const dataPoint = cloneDataPoint(data)!;

	if ((event as TouchEvent).touches) {
		x = chartInstance.scales[state.xAxisID].getValueForPixel(
			(event as TouchEvent).touches[0].clientX -
				chartInstance.canvas.getBoundingClientRect().left,
		);
		y = chartInstance.scales[state.yAxisID].getValueForPixel(
			(event as TouchEvent).touches[0].clientY -
				chartInstance.canvas.getBoundingClientRect().top,
		);
	} else {
		x = chartInstance.scales[state.xAxisID].getValueForPixel(
			(event as MouseEvent).clientX -
				chartInstance.canvas.getBoundingClientRect().left,
		);
		y = chartInstance.scales[state.yAxisID].getValueForPixel(
			(event as MouseEvent).clientY -
				chartInstance.canvas.getBoundingClientRect().top,
		);
	}

	const rounding = (
		chartInstance.config.options?.plugins
			?.dragData as OptionalPluginConfiguration<TType>
	)?.round;

	x = roundValue(x!, rounding);
	y = roundValue(y!, rounding);

	x =
		x > chartInstance.scales[state.xAxisID].max
			? chartInstance.scales[state.xAxisID].max
			: x;
	x =
		x < chartInstance.scales[state.xAxisID].min
			? chartInstance.scales[state.xAxisID].min
			: x;

	y =
		y > chartInstance.scales[state.yAxisID].max
			? chartInstance.scales[state.yAxisID].max
			: y;
	y =
		y < chartInstance.scales[state.yAxisID].min
			? chartInstance.scales[state.yAxisID].min
			: y;

	if (state.floatingBar) {
		// x contains the new value for one end of the floating bar
		// dataPoint contains the old interval [left, right] of the floating bar
		// calculate difference between the new value and both sides
		// the side with the smallest difference from the new value was the one that was dragged
		// return an interval with new value on the dragged side and old value on the other side
		let newVal;
		// choose the right variable based on the orientation of the graph (vertical, horizontal)
		if (chartInstance.config.options?.indexAxis === "y") {
			newVal = x;
		} else {
			newVal = y;
		}
		const diffFromLeft = Math.abs(newVal - (dataPoint as [number, number])[0]);
		const diffFromRight = Math.abs(newVal - (dataPoint as [number, number])[1]);

		if (diffFromLeft <= diffFromRight) {
			(dataPoint as [number, number])[0] = newVal;
		} else {
			(dataPoint as [number, number])[1] = newVal;
		}

		return dataPoint;
	}

	if ((dataPoint as Point).x !== undefined && !xAxisDraggingDisabled) {
		(dataPoint as Point).x = x;
	}

	if ((dataPoint as Point).y !== undefined) {
		if (!yAxisDraggingDisabled) {
			(dataPoint as Point).y = y;
		}
		return dataPoint;
	} else {
		if (chartInstance.config.options?.indexAxis === "y") {
			if (!xAxisDraggingDisabled) {
				return x;
			} else {
				return dataPoint;
			}
		} else {
			if (!yAxisDraggingDisabled) {
				return y;
			} else {
				return dataPoint;
			}
		}
	}
}
