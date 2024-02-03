import type { Page } from "playwright";
import { expect } from "playwright-test-coverage";

import {
	GenericDragTestParams,
	_genericTestDrag,
} from "../../__fixtures__/generic/interaction";
import {
	playwrightCalcCanvasBB,
	playwrightGetChartDatasetMeta,
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
	const canvasBB = await playwrightCalcCanvasBB(page);

	return await _genericTestDrag({
		...parameters,
		canvasBB,
		performDrag: async (dragStartPoint, dragDestPoint) => {
			await page.mouse.move(...dragStartPoint.toArray());
			await page.mouse.down();
			await page.mouse.move(...dragDestPoint.toArray());
			await page.mouse.up();
		},
		getChartDatasetMeta: (datasetIndex) =>
			playwrightGetChartDatasetMeta(page, datasetIndex),
		isDragDataPluginEnabled: !isDragDataPluginDisabled,
		bExpectResult: true,
		expect,
	});
}
