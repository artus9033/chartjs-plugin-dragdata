import type { Expect } from "playwright/test";

import Offset2D from "../../__utils__/Offset2D";
import Point2D from "../../__utils__/Point2D";
import { AxisSpec } from "../../__utils__/axisSpec";
import { calcDragTargetPosition } from "../../__utils__/cartesian";
import {
	GetChartDatasetMetaFunc,
	getDatasetPointLocation,
} from "../../__utils__/chartUtils";
import { DatasetPointSpec } from "../../__utils__/testTypes";
import { CustomMatchers } from "../../typings";

export type GenericDragTestParams = {
	/** function to run as init at the beginning of this operation */
	initFunc?: () => Promise<void> | void;
	/** the function used to perform the actual drag on the window */
	performDrag: (
		dragStartPoint: Point2D,
		dragDestPoint: Point2D,
	) => Promise<void> | void;
	/** DOMRect of the Chart canvas */
	canvasBB: DOMRect;
	/** function returning the {@see {`DatasetMeta`}} of Chart.js */
	getChartDatasetMeta: GetChartDatasetMetaFunc;
	/** specification of the dragged point; also used as the expected final point position if `isDragDataPluginEnabled` is `false` and `expectedDestPointSpecOverride` is not passed in */
	dragPointSpec: DatasetPointSpec;
	/** specification of the destination to where drag the point specified by `dragPointSpec`;
	 * it is used by default when `isDragDataPluginEnabled` is `true` and `expectedDestPointSpecOverride` is not passed in
	 */
	dragDestPointSpecOrStartPointOffset: DatasetPointSpec | Offset2D;
	/** constrains, on which axis or which axes to drag on */
	whichAxis: AxisSpec;
	/** constrains, which axis or axes are actually draggable according to the tested Chart's configuration */
	draggableAxis: AxisSpec;
	/** whether the drag data plugin is even enabled and we should expect anything to change after a drag or remain the same */
	isDragDataPluginEnabled: boolean;
	/** specification of the expected destination point that overrides the default behaviour
	 * (which is using either `dragDestPointSpecOrStartPointOffset` with `whichAxis`, `draggableAxis`,
	 * `isCategoricalX` & `isCategoricalY` constraints applied), evaluated before interactions;
	 *
	 * only used if `bExpectResult` is `true` and `isDragDataPluginEnabled` is `true` */
	expectedDestPointSpecOverride?: DatasetPointSpec;
	/** whether the X axis is categorical; in reality, this means that regardless of `draggableAxis`, tests should expect
	 * the point not to move on the X axis if this is `true` */
	isCategoricalX?: boolean;
	/** whether the Y axis is categorical; in reality, this means that regardless of `draggableAxis`, tests should expect
	 * the point not to move on the Y axis if this is `true` */
	isCategoricalY?: boolean;
} & (
	| {
			/** whether to assert the result at all - **overrides all other expectation parameters**  */
			bExpectResult: true;
			/** the `expect` function to use - either Playwright's or Jest's  */
			expect: Expect<CustomMatchers> | jest.Expect;
	  }
	| {
			bExpectResult: false;
			expect?: never;
	  }
);

export async function _genericTestDrag({
	initFunc,
	performDrag,
	canvasBB,
	getChartDatasetMeta,
	dragPointSpec,
	dragDestPointSpecOrStartPointOffset,
	whichAxis,
	draggableAxis,
	isDragDataPluginEnabled,
	bExpectResult = true,
	expect,
	isCategoricalX,
	isCategoricalY,
	expectedDestPointSpecOverride,
}: GenericDragTestParams) {
	await initFunc?.();

	let dragStartPoint: Point2D = await getDatasetPointLocation(
			getChartDatasetMeta,
			dragPointSpec,
			canvasBB,
		),
		dragRefPoint: Point2D =
			dragDestPointSpecOrStartPointOffset instanceof Offset2D
				? dragDestPointSpecOrStartPointOffset.translatePoint(dragStartPoint)
				: await getDatasetPointLocation(
						getChartDatasetMeta,
						dragDestPointSpecOrStartPointOffset,
						canvasBB,
					),
		dragDestPoint = calcDragTargetPosition(
			dragStartPoint,
			dragRefPoint,
			whichAxis,
			"both", // pretend all axes are draggable for interaction
		),
		expectedDestPointOverride = expectedDestPointSpecOverride
			? await getDatasetPointLocation(
					getChartDatasetMeta,
					expectedDestPointSpecOverride,
					canvasBB,
				)
			: undefined;

	// simulate a drag event
	await performDrag(dragStartPoint, dragDestPoint);

	// check if the values match after dragging
	let actualNewDraggedPointLocation: Point2D = await getDatasetPointLocation(
		getChartDatasetMeta,
		dragPointSpec,
	);

	if (bExpectResult) {
		if (isDragDataPluginEnabled) {
			let realDraggableAxis: AxisSpec | undefined = draggableAxis;
			// constrain the draggable axis according to how the axes are configured for real - we want to expect the proper position
			if (isCategoricalX) {
				// in categorical charts with the index axis being x, dragging on the x axis is not possible
				if (realDraggableAxis === "x") {
					realDraggableAxis = undefined; // no axis is draggable, then
				} else if (realDraggableAxis === "both") {
					realDraggableAxis = "y"; // only the y axis is draggable
				}
			}

			if (isCategoricalY) {
				// in categorical charts with the index axis being y, dragging on the y axis is not possible
				if (realDraggableAxis === "y") {
					realDraggableAxis = undefined; // no axis is draggable, then
				} else if (realDraggableAxis === "both") {
					realDraggableAxis = "x"; // only the x axis is draggable
				}
			}

			const expectedDestPoint = calcDragTargetPosition(
				dragStartPoint,
				expectedDestPointOverride ?? dragRefPoint,
				whichAxis,
				realDraggableAxis,
			);

			// if plugin is enabled, then the new position should match destination point position constrained to the allowed draggable axis
			expect?.(actualNewDraggedPointLocation).pointsToBeClose(
				expectedDestPoint,
			);
		} else {
			// if plugin is disabled, then the new position should not have changed at all
			expect?.(actualNewDraggedPointLocation).pointsToBeClose(dragStartPoint);
		}
	}
}
