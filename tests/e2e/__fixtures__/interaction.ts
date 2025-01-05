import type { Page } from "playwright";
import { expect, test } from "playwright-test-coverage";
import { Signale } from "signale";

import {
	GenericDragTestParams,
	_genericTestDrag,
} from "../../__fixtures__/generic/interaction";
import Offset2D from "../../__utils__/structures/Offset2D";
import Point2D, { BoundingBox } from "../../__utils__/structures/Point2D";
import { getAxisDescription } from "../../__utils__/structures/axisSpec";
import { describeDatasetPointSpecOrPoint } from "../../__utils__/structures/scenario";
import {
	playwrightCalcCanvasBB,
	playwrightGetChartDatasetSamplePixelPosition,
	playwrightGetChartScales,
} from "../__utils__/chartUtils";
import { hasGUI } from "../__utils__/testHelpers";

export type PlaywrightTestDragParams = {
	page: Page;
	isDragDataPluginDisabled?: boolean;
	additionalInfo?: string;
} & Pick<
	GenericDragTestParams,
	| "dragPointSpec"
	| "dragDestPointSpecOrStartPointOffset"
	| "whichAxis"
	| "draggableAxis"
	| "isCategoricalX"
	| "isCategoricalY"
	| "expectedDestPointSpecOverride"
	| "magnet"
	| "getDataFromPointOnScreen"
>;

const playwrightTestDragSignale = new Signale({
	scope: "playwrightTestDrag",
});

export async function playwrightTestDrag({
	page,
	isDragDataPluginDisabled = false,
	magnet,
	additionalInfo,
	...parameters
}: PlaywrightTestDragParams) {
	await test.step(`Test drag on axis: ${parameters.whichAxis} from ${parameters.dragPointSpec} to ${parameters.expectedDestPointSpecOverride ?? parameters.dragDestPointSpecOrStartPointOffset}`, async () => {
		const canvasBB = await playwrightCalcCanvasBB(page),
			windowBB: BoundingBox = await page.evaluate(() => ({
				x: 0,
				y: 0,
				width: window.innerWidth,
				height: window.innerHeight,
			}));

		return await _genericTestDrag({
			...parameters,
			canvasBB,
			additionalInfo:
				`${describeDatasetPointSpecOrPoint(parameters.dragPointSpec)} -> ${describeDatasetPointSpecOrPoint(parameters.dragDestPointSpecOrStartPointOffset)} on ${getAxisDescription(parameters.whichAxis)}${additionalInfo ?? ""}\n` +
				JSON.stringify(
					{
						isCategoricalX: parameters.isCategoricalX,
						isCategoricalY: parameters.isCategoricalY,
					},
					undefined,
					4,
				),
			performDrag: async ({ dragStartPoint, dragDestPoint }) => {
				// playwright "loops" the cursor when leaving the window bounds, thus we want to clip the coordinates
				dragStartPoint = dragStartPoint.copyConstrainedTo(windowBB);
				dragDestPoint = dragDestPoint.copyConstrainedTo(windowBB);

				if (hasGUI()) {
					playwrightTestDragSignale.log(
						`Dragging ${dragStartPoint.toString()} -> ${dragDestPoint.toString()}`,
					);
				}

				await page.mouse.move(...dragStartPoint.toArray(), {
					steps: hasGUI() ? 8 : undefined,
				});
				await page.mouse.down();

				await page.mouse.move(...dragDestPoint.toArray(), {
					steps: hasGUI() ? 8 : undefined,
				});
				await page.mouse.up();
			},
			getChartDatasetSamplePixelPosition: (datasetIndex, sampleIndex) =>
				playwrightGetChartDatasetSamplePixelPosition(
					page,
					datasetIndex,
					sampleIndex,
				),
			getChartScales: () => playwrightGetChartScales(page),
			isDragDataPluginEnabled: !isDragDataPluginDisabled,
			bExpectResult: true,
			expect: expect as any,
			...(magnet
				? {
						magnet,
						getDataFromPointOnScreen: async (pointOnScreen, canvasBB) => {
							pointOnScreen = new Offset2D({
								xAbs: -canvasBB.x,
								yAbs: -canvasBB.y,
							}).translatePoint(pointOnScreen);

							const { x, y } = await page.evaluate(
								(pointOnScreen) => ({
									x: window.testedChart.scales["x"].getValueForPixel(
										pointOnScreen.x,
									),
									y: window.testedChart.scales["y"].getValueForPixel(
										pointOnScreen.y,
									),
								}),
								pointOnScreen,
							);

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
			getCoordinateOnScaleForAxis: async (data, axis) => {
				return await page.evaluate(
					({ data, axis }) =>
						isNaN(data)
							? NaN
							: window.testedChart.scales[axis].getPixelForValue(data),
					{ data, axis },
				);
			},
		});
	});
}
