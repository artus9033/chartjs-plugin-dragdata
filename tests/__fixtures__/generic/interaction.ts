import _ from "lodash";
import type { Expect } from "playwright/test";

import {
	calcDragTargetPosition,
	euclideanDistance,
} from "../../__utils__/cartesian";
import {
	GetChartDatasetSamplePixelPositionFunc,
	GetChartScalesFunc,
	getDatasetPointLocationOnScreen,
} from "../../__utils__/chartUtils";
import {
	MagnetEstimatedErrors,
	MagnetImplementations,
	MagnetVariant,
} from "../../__utils__/magnet";
import Offset2D, { Offset2DScale } from "../../__utils__/structures/Offset2D";
import Point2D, { BoundingBox } from "../../__utils__/structures/Point2D";
import { AxisSpec } from "../../__utils__/structures/axisSpec";
import { DatasetPointSpec } from "../../__utils__/testTypes";
import { CustomMatchers } from "../../typings";

export type GetDataFromPointOnScreenFunc = (
	pointOnScreen: Point2D,
	canvasBB: BoundingBox,
) => Promise<Point2D | number | undefined>;

export type GetCoordinateOnScaleForAxisFunc = (
	data: number,
	axis: "x" | "y",
) => Promise<number>;

export type GenericDragTestParams = {
	/** function to run as init at the beginning of this operation */
	initFunc?: () => Promise<void> | void;
	/** the function used to perform the actual drag on the window */
	performDrag: (options: {
		dragStartPoint: Point2D;
		dragDestPoint: Point2D;
	}) => Promise<void> | void;
	/** DOMRect of the Chart canvas */
	canvasBB: DOMRect;
	/** function returning the position ({@see {Point2D}}) of the specified dataset sample */
	getChartDatasetSamplePixelPosition: GetChartDatasetSamplePixelPositionFunc;
	/** function returning the {@see {`Chart["scales"]`}} of Chart.js */
	getChartScales: GetChartScalesFunc;
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
	/** finds the {@see {Point2D}} on screen for a given chart value */
	getCoordinateOnScaleForAxis: GetCoordinateOnScaleForAxisFunc;
	/** the comment to be shown when drag assertion fails (helps identify which step does it link to) */
	additionalInfo?: string;
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
) &
	(
		| {
				/** string enum used to determine the actual value-rounding function implementation for this test */
				magnet: MagnetVariant;
				/** finds the {@see {ChartData}} for a given position on screen */
				getDataFromPointOnScreen: GetDataFromPointOnScreenFunc;
		  }
		| {
				magnet?: never;
				getDataFromPointOnScreen?: never;
		  }
	);

export async function _genericTestDrag({
	initFunc,
	performDrag,
	canvasBB,
	getChartDatasetSamplePixelPosition,
	getChartScales,
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
	magnet,
	getDataFromPointOnScreen,
	getCoordinateOnScaleForAxis,
	additionalInfo,
}: GenericDragTestParams) {
	await initFunc?.();

	const chartScales = await getChartScales(),
		chartAreaBB: BoundingBox = {
			x: canvasBB.left + chartScales.x.left,
			y: canvasBB.top + chartScales.y.top,
			width: chartScales.x.right - chartScales.x.left,
			height: chartScales.y.bottom - chartScales.y.top,
		};

	/** represents the scale that needs to be applied to a point carrying
	 * values in chart-values (values of the data samples) to produce
	 * a point in screen-pixel values (relative, not absolute) that
	 * correspond to the delta of these data-sample-unit values,
	 * for both axes
	 *
	 * **NOTE**: this also takes into account the case when any axis is categorical
	 * and in such case +N means moving forward by N labels and -N means moving backward by N labels
	 */
	let canvasDragDestPointSpecChartValueToPxScale =
		await calculateChartValueToPxScale(
			chartScales,
			getCoordinateOnScaleForAxis,
		);

	let dragStartPoint: Point2D = await getDatasetPointLocationOnScreen(
			getChartDatasetSamplePixelPosition,
			dragPointSpec,
			canvasBB,
		),
		dragDesiredDestPoint: Point2D =
			dragDestPointSpecOrStartPointOffset instanceof Offset2D
				? dragDestPointSpecOrStartPointOffset.translatePoint(dragStartPoint)
				: (
						dragDestPointSpecOrStartPointOffset.additionalOffset?.scaledCopy(
							canvasDragDestPointSpecChartValueToPxScale,
						) ?? new Offset2D({ x: 0, y: 0 })
					) // by default, no offset
						.translatePoint(
							await getDatasetPointLocationOnScreen(
								getChartDatasetSamplePixelPosition,
								dragDestPointSpecOrStartPointOffset,
								canvasBB,
							),
						),
		dragDestPoint = calcDragTargetPosition(
			dragStartPoint,
			dragDesiredDestPoint,
			whichAxis,
			"both", // pretend all axes are draggable for interaction
			undefined, // on purpose we don't want to constrain the point here - some tests may want to drag the point outside canvas bounds
		),
		expectedDestPointOverride = expectedDestPointSpecOverride
			? await getDatasetPointLocationOnScreen(
					getChartDatasetSamplePixelPosition,
					expectedDestPointSpecOverride,
					canvasBB,
				)
			: undefined;

	// simulate a drag event
	await performDrag({
		dragStartPoint,
		dragDestPoint,
	});

	// check if the values match after dragging
	let actualNewDraggedPointLocation: Point2D =
		await getDatasetPointLocationOnScreen(
			getChartDatasetSamplePixelPosition,
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

			let expectedDestPoint = calcDragTargetPosition(
				dragStartPoint,
				expectedDestPointOverride ?? dragDesiredDestPoint,
				whichAxis,
				realDraggableAxis,
				chartAreaBB,
			);

			let pointDistanceTolerance: number | undefined = undefined; // if magnet is disabled, then leave the default (low) tolerance

			// if applicable, assert that the value has been rounded as per how the magnet is set up
			if (magnet) {
				let actualData = await getDataFromPointOnScreen(
					actualNewDraggedPointLocation,
					canvasBB,
				);

				const magnetImpl = MagnetImplementations[magnet],
					magnetEstimatedError = MagnetEstimatedErrors[magnet];

				if (magnetImpl) {
					if (actualData === null || actualData === undefined) {
						throw new Error(
							`_genericTestDrag: cannot get data from point on screen: ${actualNewDraggedPointLocation}`,
						);
					}

					let actualDataAfterMagnet = applyMagnet(magnet, actualData);

					// the magnet shall not alter the data sample anymore if it has already been applied;
					// strict position checking is done below, in the normal expect
					if (typeof actualDataAfterMagnet === "number") {
						expect?.(actualData as number).toBeCloseTo(
							actualDataAfterMagnet,
							6,
						); // tolerance up to 1e-6
					} else {
						expect?.(actualData as number).pointsToBeClose(
							actualDataAfterMagnet,
							euclideanDistance(
								new Point2D({ x: 0, y: 0 }),
								new Point2D({ x: 0 + 1e-6, y: 0 + 1e-6 }), // tolerance up to 1e-6
							),
							`${additionalInfo} (with magnet ${magnet})`,
						);
					}

					const expectedValue = await getDataFromPointOnScreen(
						expectedDestPoint,
						canvasBB,
					);

					if (expectedValue) {
						let expectedValueAfterMagnet = applyMagnet(magnet, expectedValue);

						if (typeof expectedValueAfterMagnet === "number") {
							if (isCategoricalX) {
								expectedDestPoint = new Point2D({
									x: expectedDestPoint.x,
									y:
										(await getCoordinateOnScaleForAxis(
											expectedValueAfterMagnet,
											"y",
										)) + canvasBB.top,
								});
							} else {
								// isCategoricalY is true

								expectedDestPoint = new Point2D({
									x:
										(await getCoordinateOnScaleForAxis(
											expectedValueAfterMagnet,
											"x",
										)) + canvasBB.left,
									y: expectedDestPoint.y,
								});
							}
						} else {
							expectedDestPoint = new Offset2D({
								x: canvasBB.left,
								y: canvasBB.top,
							}).translatePoint(
								new Point2D({
									x: await getCoordinateOnScaleForAxis(
										expectedValueAfterMagnet.x,
										"x",
									),
									y: await getCoordinateOnScaleForAxis(
										expectedValueAfterMagnet.y,
										"y",
									),
								}),
							);
						}
					}

					/**
					 * since applyMagnet estimates the position from the rounded estimated coordinates,
					 * it might happen that the estimation error influences the rounding in such a way that
					 * e.g. 6.04 ~= 6 vs 6.05 ~= 6.1 when rounding to the 1st decimal place,
					 * thus to overcome this issue we want to allow for a bigger maximum distance
					 */

					// calculate the differences in pixels for values different by the value error caused by the magnet
					let magnetEstimatedErrorOnScreenX =
							canvasDragDestPointSpecChartValueToPxScale.x *
							magnetEstimatedError,
						magnetEstimatedErrorOnScreenY =
							canvasDragDestPointSpecChartValueToPxScale.y *
							magnetEstimatedError;

					// calculate the euclidean distance between points differing by the estimated max error on each of the axes
					pointDistanceTolerance = euclideanDistance(
						new Point2D({ x: 0, y: 0 }),
						new Point2D({
							x: 0 + magnetEstimatedErrorOnScreenX,
							y: 0 + magnetEstimatedErrorOnScreenY,
						}), // tolerance up to the estimated error
					);
				}
			}

			// if plugin is enabled, then the new position should match destination point position constrained to the allowed draggable axis
			expect?.(actualNewDraggedPointLocation).pointsToBeClose(
				expectedDestPoint,
				pointDistanceTolerance,
				additionalInfo,
			);
		} else {
			// if plugin is disabled, then the new position should not have changed at all
			expect?.(actualNewDraggedPointLocation).pointsToBeClose(
				dragStartPoint,
				undefined,
				`${additionalInfo} (plugin disabled)`,
			);
		}
	}
}

function applyMagnet<Data extends number | Point2D>(
	magnet: MagnetVariant,
	data: Data,
): Data {
	const magnetImpl = MagnetImplementations[magnet];

	if (magnetImpl) {
		let dataCpy = _.cloneDeep(data);

		// the magnet shall not alter the data sample anymore if it has already been applied;
		// strict position checking is done below, in the normal expect
		if (typeof dataCpy === "number") {
			(dataCpy as number) = magnetImpl(dataCpy);

			return dataCpy;
		} else {
			dataCpy = new Point2D({
				x: magnetImpl(dataCpy.x as number),
				y: magnetImpl(dataCpy.y as number),
			}) as Data;

			return dataCpy;
		}
	}

	return data;
}

async function calculateChartValueToPxScale(
	chartScales: Awaited<ReturnType<GetChartScalesFunc>>,
	getCoordinateOnScaleForAxis: GetCoordinateOnScaleForAxisFunc,
): Promise<Offset2DScale> {
	// ensure the point would be on-screen by specifying the middle of the chart
	const middleValueX = (chartScales.x.min + chartScales.x.max) / 2,
		middleValueY = (chartScales.y.min + chartScales.y.max) / 2;

	return {
		x: Math.abs(
			(await getCoordinateOnScaleForAxis(middleValueX, "x")) -
				(await getCoordinateOnScaleForAxis(middleValueX + 1, "x")),
		),
		y: Math.abs(
			(await getCoordinateOnScaleForAxis(middleValueY, "y")) -
				(await getCoordinateOnScaleForAxis(middleValueY + 1, "y")),
		),
	};
}
