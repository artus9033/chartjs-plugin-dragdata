import type { Page } from "playwright";
import { expect } from "playwright-test-coverage";

import {
	GenericDragTestParams,
	_genericTestDrag,
} from "../../__fixtures__/generic/interaction";
import { BoundingBox } from "../../__utils__/structures/Point2D";
import {
	playwrightCalcCanvasBB,
	playwrightGetChartDatasetMeta,
	playwrightGetChartScales,
} from "../__utils__/chartUtils";

export async function playwrightTestDrag({
	page,
	isDragDataPluginDisabled = false,
	...parameters
}: {
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
>) {
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
		performDrag: async (dragStartPoint, dragDestPoint) => {
			// playwright "loops" the cursor when leaving the window bounds, thus we want to clip the coordinates
			dragStartPoint = dragStartPoint.copyConstrainedTo(windowBB);
			dragDestPoint = dragDestPoint.copyConstrainedTo(windowBB);

			await page.mouse.move(...dragStartPoint.toArray());
			await page.mouse.down();
			await page.mouse.move(...dragDestPoint.toArray());
			await page.mouse.up();
		},
		getChartDatasetMeta: (datasetIndex) =>
			playwrightGetChartDatasetMeta(page, datasetIndex),
		getChartScales: () => playwrightGetChartScales(page),
		isDragDataPluginEnabled: !isDragDataPluginDisabled,
		bExpectResult: true,
		expect,
	});
}
