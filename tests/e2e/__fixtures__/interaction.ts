import type { Page } from "playwright";
import { expect } from "playwright-test-coverage";

import {
	GenericDragTestParams,
	_genericTestDrag,
} from "../../__fixtures__/generic/interaction";
import Offset2D from "../../__utils__/structures/Offset2D";
import Point2D, { BoundingBox } from "../../__utils__/structures/Point2D";
import {
	isSimpleWhitelistItemAllowed,
	isTestsConfigWhitelistItemAllowed,
} from "../../__utils__/testsConfig";
import {
	playwrightCalcCanvasBB,
	playwrightGetChartDatasetSamplePixelPosition,
	playwrightGetChartScales,
} from "../__utils__/chartUtils";

export type PlaywrightTestDragParams = {
	page: Page;
	isDragDataPluginDisabled?: boolean;
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
	| "assertScreenshots"
>;

export async function playwrightTestDrag({
	page,
	isDragDataPluginDisabled = false,
	magnet,
	...parameters
}: PlaywrightTestDragParams) {
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
		performDrag: async ({
			dragStartPoint,
			dragDestPoint,
			assertScreenshots,
			whenToTakeScreenshots,
		}) => {
			// playwright "loops" the cursor when leaving the window bounds, thus we want to clip the coordinates
			dragStartPoint = dragStartPoint.copyConstrainedTo(windowBB);
			dragDestPoint = dragDestPoint.copyConstrainedTo(windowBB);

			await page.mouse.move(...dragStartPoint.toArray());
			await page.mouse.down();

			if (
				assertScreenshots &&
				isSimpleWhitelistItemAllowed(whenToTakeScreenshots, "afterMouseDown")
			) {
				await expect(page).toHaveScreenshot();
			}

			await page.mouse.move(...dragDestPoint.toArray());
			await page.mouse.up();

			if (
				assertScreenshots &&
				isSimpleWhitelistItemAllowed(whenToTakeScreenshots, "afterMouseDown")
			) {
				await expect(page).toHaveScreenshot();
			}
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
		expect,
		...(magnet
			? {
					magnet,
					getDataFromPointOnScreen: async (pointOnScreen, canvasBB) => {
						pointOnScreen = new Offset2D({
							x: -canvasBB.x,
							y: -canvasBB.y,
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
					getCoordinateOnScaleForAxis: async (data, axis) => {
						return await page.evaluate(
							({ data, axis }) =>
								isNaN(data)
									? NaN
									: window.testedChart.scales[axis].getPixelForValue(data),
							{ data, axis },
						);
					},
				}
			: { magnet: undefined, getDataFromPointOnScreen: undefined }),
	});
}
