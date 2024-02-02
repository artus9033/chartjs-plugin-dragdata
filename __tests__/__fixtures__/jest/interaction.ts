import { Chart } from "chart.js";

import { fireEvent } from "@testing-library/react";

import Point2D from "../../__utils__/Point2D";
import { AxisSpec } from "../../__utils__/axisSpec";
import { DatasetPointSpec } from "../../__utils__/testTypes";
import { _genericTestDrag } from "../generic/interaction";

export async function performDragWithoutTesting(
	chart: Chart,
	dragPointSpec: DatasetPointSpec,
	destRefPointOrSpec: DatasetPointSpec | Point2D,
	whichAxis: AxisSpec,
) {
	const canvasBB = chart.canvas.getBoundingClientRect();

	const getChartDatasetMeta = (datasetIndex: number) =>
		chart.getDatasetMeta(datasetIndex);

	return await _genericTestDrag({
		canvasBB,
		performDrag: (dragStartPoint, dragDestPoint) => {
			fireEvent.mouseDown(chart.canvas, {
				clientX: canvasBB.top + dragStartPoint.x,
				clientY: canvasBB.left + dragStartPoint.y,
				cancelable: true,
				bubbles: true,
				view: window,
			});
			fireEvent.mouseMove(chart.canvas, {
				clientX: canvasBB.top + dragDestPoint.x,
				clientY: canvasBB.left + dragDestPoint.y,
				cancelable: true,
				bubbles: true,
				view: window,
			});
			fireEvent.mouseUp(chart.canvas, {
				view: window,
			});
		},
		getChartDatasetMeta: getChartDatasetMeta,
		dragPointSpec,
		destRefPointOrSpec,
		whichAxis,
		isDragDataPluginEnabled: (chart.options.plugins as any).dragData,
		// in Jest environment, rendering on the canvas does not work as
		// expected & positions of data points are calculated wrong,
		// thus it does not make sense to test this behaviour - such tests are done during E2E testing
		bExpectResult: false,
	});
}
