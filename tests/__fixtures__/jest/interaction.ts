import type { Chart } from "chart.js";

import { fireEvent } from "@testing-library/react";

import Offset2D from "../../__utils__/structures/Offset2D";
import Point2D from "../../__utils__/structures/Point2D";
import { getAxisDescription } from "../../__utils__/structures/axisSpec";
import { describeDatasetPointSpecOrPoint } from "../../__utils__/structures/scenario";
import {
	GenericDragTestParams,
	_genericTestDrag,
} from "../generic/interaction";

export async function performDragWithoutTesting({
	chart,
	magnet,
	...parameters
}: {
	chart: Chart;
} & Pick<
	GenericDragTestParams,
	| "dragPointSpec"
	| "dragDestPointSpecOrStartPointOffset"
	| "whichAxis"
	| "draggableAxis"
	| "magnet"
>) {
	const canvasBB = chart.canvas.getBoundingClientRect();

	const getChartScales = () => chart.scales;

	return await _genericTestDrag({
		...parameters,
		canvasBB,
		additionalInfo: `${describeDatasetPointSpecOrPoint(parameters.dragPointSpec)} -> ${describeDatasetPointSpecOrPoint(parameters.dragDestPointSpecOrStartPointOffset)} on ${getAxisDescription(parameters.whichAxis)}`,
		performDrag: ({ dragStartPoint, dragDestPoint }) => {
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
		...(magnet
			? {
					magnet,
					getDataFromPointOnScreen: async (pointOnScreen, canvasBB) => {
						pointOnScreen = new Offset2D({
							x: -canvasBB.x,
							y: -canvasBB.y,
						}).translatePoint(pointOnScreen);

						const { x, y } = {
							x: window.testedChart.scales["x"].getValueForPixel(
								pointOnScreen.x,
							),
							y: window.testedChart.scales["y"].getValueForPixel(
								pointOnScreen.y,
							),
						};

						return x === undefined
							? y === undefined
								? undefined
								: y
							: y === undefined
								? x
								: new Point2D({ x, y });
					},
				}
			: { magnet: undefined, getDataFromPointOnScreen: undefined }),
		getCoordinateOnScaleForAxis: async (data, axis) =>
			isNaN(data) ? NaN : chart.scales[axis].getPixelForValue(data),
	});
}
