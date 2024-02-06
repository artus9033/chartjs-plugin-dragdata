import type { Page } from "playwright";

export async function playwrightCalcCanvasBB(page: Page): Promise<DOMRect> {
	return await page.evaluate(
		/* istanbul ignore next - fixes fatal errors when evaluating outside of original context, see https://github.com/istanbuljs/istanbuljs/issues/499#issuecomment-580358011 */
		() => window.test.canvas.getBoundingClientRect(),
	);
}

export async function playwrightGetChartDatasetMeta(
	page: Page,
	datasetIndex: number,
) {
	return await page.evaluate(
		/* istanbul ignore next - fixes fatal errors when evaluating outside of original context, see https://github.com/istanbuljs/istanbuljs/issues/499#issuecomment-580358011 */
		({ datasetIndex }) => window.test.getDatasetMeta(datasetIndex),
		{ datasetIndex },
	);
}

export async function playwrightGetChartScales(page: Page) {
	return await page.evaluate(
		/* istanbul ignore next - fixes fatal errors when evaluating outside of original context, see https://github.com/istanbuljs/istanbuljs/issues/499#issuecomment-580358011 */
		() => window.test.scales,
	);
}
