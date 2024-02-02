import { Expect } from "playwright/test";

import Point2D from "../../__utils__/Point2D";
import { AxisSpec } from "../../__utils__/axisSpec";
import { calcDragTargetPosition } from "../../__utils__/cartesian";
import {
	GetChartDatasetMetaFunc,
	getDatasetPointLocation,
} from "../../__utils__/chartUtils";
import { DatasetPointSpec } from "../../__utils__/testTypes";
import { CustomMatchers } from "../../typings";

export async function _genericTestDrag({
	initFunc,
	performDrag,
	canvasBB,
	getChartDatasetMeta: getChartDatasetMeta,
	dragPointSpec,
	destRefPointOrSpec,
	whichAxis,
	isDragDataPluginEnabled,
	bExpectResult = true,
	expect,
}: {
	initFunc?: () => Promise<void> | void;
	performDrag: (
		dragStartPoint: Point2D,
		dragDestPoint: Point2D,
	) => Promise<void> | void;
	canvasBB: DOMRect;
	getChartDatasetMeta: GetChartDatasetMetaFunc;
	dragPointSpec: DatasetPointSpec;
	destRefPointOrSpec: DatasetPointSpec | Point2D;
	whichAxis: AxisSpec;
	isDragDataPluginEnabled: boolean;
} & (
	| {
			bExpectResult: true;
			expect: Expect<CustomMatchers> | jest.Expect;
	  }
	| {
			bExpectResult: false;
			expect?: never;
	  }
)) {
	await initFunc?.();

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
	await performDrag(dragStartPoint, dragDestPoint);

	// check if the values match after dragging
	let actualNewDraggedPointLocation: Point2D = await getDatasetPointLocation(
		getChartDatasetMeta,
		dragPointSpec,
	);

	if (bExpectResult) {
		// TODO: fix this later with proper TS typings
		if (isDragDataPluginEnabled) {
			// if plugin is enabled, then the new position should match destination point position
			expect?.(actualNewDraggedPointLocation).pointsToBeClose(dragDestPoint);
		} else {
			// if plugin is disabled, then the new position should not have changed at all
			expect?.(actualNewDraggedPointLocation).pointsToBeClose(dragStartPoint);
		}
	}
}
