import { Chart } from "chart.js";
import { expect } from "playwright-test-coverage";

import { fireEvent } from "@testing-library/react";

import Point2D from "../__utils__/Point2D";
import { calcDragTargetPosition } from "../__utils__/cartesian";
import { getDatasetPointLocation } from "../__utils__/chartUtils";
import { AxisSpec, DatasetPointSpec } from "../__utils__/testTypes";

export async function expectDragSuccessful(
	chart: Chart,
	dragPointSpec: DatasetPointSpec,
	destRefPointOrSpec: DatasetPointSpec | Point2D,
	whichAxis: AxisSpec,
) {
	const canvasBB = chart.canvas.getBoundingClientRect();

	const getChartDatasetMeta = (datasetIndex: number) =>
		chart.getDatasetMeta(datasetIndex);

	let dragStartPoint: Point2D = await getDatasetPointLocation(
			getChartDatasetMeta,
			dragPointSpec,
			canvasBB,
		),
		dragRefPoint: Point2D =
			destRefPointOrSpec instanceof Point2D
				? destRefPointOrSpec
				: await getDatasetPointLocation(
						getChartDatasetMeta,
						destRefPointOrSpec,
						canvasBB,
					),
		dragDestPoint = calcDragTargetPosition(
			dragStartPoint,
			dragRefPoint,
			whichAxis,
		);

	// simulate a drag event
	fireEvent.mouseDown(chart.canvas, { clientX: 50, clientY: 50, view: window });
	fireEvent.mouseMove(chart.canvas, {
		clientX: 100,
		clientY: 100,
		view: window,
	});
	fireEvent.mouseUp(chart.canvas, {
		view: window,
	});

	// check if the values match after dragging
	const actualNewDraggedPointLocation = await getDatasetPointLocation(
		getChartDatasetMeta,
		dragPointSpec,
	);

	expect(actualNewDraggedPointLocation).pointsToBeClose(dragDestPoint);
}
