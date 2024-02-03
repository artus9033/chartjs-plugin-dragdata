import type { Page } from "playwright";
import { expect } from "playwright-test-coverage";

import { _genericTestDrag } from "../../__fixtures__/generic/interaction";
import Point2D from "../../__utils__/Point2D";
import { AxisSpec } from "../../__utils__/axisSpec";
import { DatasetPointSpec } from "../../__utils__/testTypes";
import {
	playwrightCalcCanvasOffset,
	playwrightGetChartDatasetMeta,
} from "../__utils__/chartUtils";

export async function playwrightTestDrag({
	page,
	dragPointSpec,
	destRefPointOrSpec,
	whichAxis,
	isDragDataPluginDisabled = false,
}: {
	page: Page;
	dragPointSpec: DatasetPointSpec;
	destRefPointOrSpec: DatasetPointSpec | Point2D;
	whichAxis: AxisSpec;
	isDragDataPluginDisabled?: boolean;
}) {
	const canvasBB = await playwrightCalcCanvasOffset(page);

	return await _genericTestDrag({
		canvasBB,
		performDrag: async (dragStartPoint, dragDestPoint) => {
			await page.mouse.move(...dragStartPoint.toArray());
			await page.mouse.down();
			await page.mouse.move(...dragDestPoint.toArray());
			await page.mouse.up();
		},
		getChartDatasetMeta: (datasetIndex) =>
			playwrightGetChartDatasetMeta(page, datasetIndex),
		dragPointSpec,
		destRefPointOrSpec,
		whichAxis,
		isDragDataPluginEnabled: !isDragDataPluginDisabled,
		bExpectResult: true,
		expect,
	});
}
