import type { Page } from "playwright";

import Point2D from "../../__utils__/structures/Point2D";

export async function playwrightCalcCanvasBB(page: Page): Promise<DOMRect> {
	return await page.evaluate(
		/* istanbul ignore next - fixes fatal errors when evaluating outside of original context, see https://github.com/istanbuljs/istanbuljs/issues/499#issuecomment-580358011 */
		() => window.testedChart.canvas.getBoundingClientRect(),
	);
}

export async function playwrightGetChartDatasetSamplePixelPosition(
	page: Page,
	datasetIndex: number,
	sampleIndex: number,
): Promise<Point2D> {
	return new Point2D(
		await page.evaluate(
			/* istanbul ignore next - fixes fatal errors when evaluating outside of original context, see https://github.com/istanbuljs/istanbuljs/issues/499#issuecomment-580358011 */
			({ datasetIndex, sampleIndex }) => {
				let sampleValue =
						window.testedChart.getDatasetMeta(datasetIndex).data[sampleIndex],
					x: number = NaN,
					y: number = NaN;

				if (typeof sampleValue === "number") {
					y = 0;
				} else if (Array.isArray(sampleValue)) {
					[x, y] = sampleValue;
				} else {
					x = sampleValue.x;
					y = sampleValue.y;
				}

				if (isNaN(x)) {
					// the chart is probably categorical, try to find the coordinates using the scales API
					x = window.testedChart.scales["x"].getPixelForTick(sampleIndex);
				}

				return {
					x,
					y,
				};
			},
			{ datasetIndex, sampleIndex },
		),
	);
}

export async function playwrightGetChartScales(page: Page) {
	return await page.evaluate(
		/* istanbul ignore next - fixes fatal errors when evaluating outside of original context, see https://github.com/istanbuljs/istanbuljs/issues/499#issuecomment-580358011 */
		() => window.testedChart.scales,
	);
}
