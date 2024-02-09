import type { Chart } from "chart.js";

import { fireEvent } from "@testing-library/react";

import { GetChartDatasetSamplePixelPositionFunc } from "../../__utils__/chartUtils";
import Point2D from "../../__utils__/structures/Point2D";
import {
	GenericDragTestParams,
	_genericTestDrag,
} from "../generic/interaction";

export async function performDragWithoutTesting({
	chart,
	...parameters
}: {
	chart: Chart;
} & Pick<
	GenericDragTestParams,
	| "dragPointSpec"
	| "dragDestPointSpecOrStartPointOffset"
	| "whichAxis"
	| "draggableAxis"
>) {
	const canvasBB = chart.canvas.getBoundingClientRect();

	const getChartScales = () => chart.scales;

	return await _genericTestDrag({
		...parameters,
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
		getChartDatasetSamplePixelPosition: (datasetIndex, sampleIndex) => {
			const meta = chart.getDatasetMeta(datasetIndex).data[sampleIndex];

			return new Point2D({
				x: meta.x,
				y: meta.y,
			});
		},
		getChartScales,
		isDragDataPluginEnabled: (chart.options.plugins as any).dragData,
		// in Jest environment, rendering on the canvas does not work as
		// expected & positions of data points are calculated wrong,
		// thus it does not make sense to test this behaviour - such tests are done during E2E testing
		bExpectResult: false,
	});
}
