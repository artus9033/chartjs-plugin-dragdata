import type { Chart } from "chart.js";
import type { Page } from "playwright";

import Point2D from "../../__utils__/Point2D";
import {
	CanvasOffset,
	getDatasetPointLocation,
} from "../../__utils__/chartUtils";
import { DatasetPointSpec } from "../../__utils__/testTypes";

export async function playwrightCalcCanvasOffset(page: Page): Promise<DOMRect> {
	return await page.evaluate(
		/* istanbul ignore next - fixes fatal errors when evaluating outside of original context, see https://github.com/istanbuljs/istanbuljs/issues/499#issuecomment-580358011 */
		() => window.test.canvas.getBoundingClientRect(),
	);
}

export async function playwrightGetDatasetPointLocation(
	page: Page,
	pointSpec: DatasetPointSpec,
	canvasOffset: CanvasOffset | null = null,
): Promise<Point2D> {
	const getChartDatasetMeta = async (datasetIndex: number) =>
		await page.evaluate(
			/* istanbul ignore next - fixes fatal errors when evaluating outside of original context, see https://github.com/istanbuljs/istanbuljs/issues/499#issuecomment-580358011 */
			({ datasetIndex }) => window.test.getDatasetMeta(datasetIndex),
			{ datasetIndex },
		);

	return new Point2D(
		await getDatasetPointLocation(getChartDatasetMeta, pointSpec, canvasOffset),
	);
}
