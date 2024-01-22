import type { Chart } from "chart.js";
import type { Page } from "playwright";

import Point2D from "../../__utils__/Point2D";
import type { DatasetPointSpec } from "../../__utils__/testTypes";

export type CanvasOffset = { left: number; top: number };

export async function calcCanvasOffset(page: Page): Promise<CanvasOffset> {
	return await page.evaluate(
		/* istanbul ignore next - fixes fatal errors when evaluating outside of original context, see https://github.com/istanbuljs/istanbuljs/issues/499#issuecomment-580358011 */
		() => {
			const { left, top } = (
				window.test as any as Chart
			).canvas.getBoundingClientRect();

			return { left, top };
		},
	);
}

export async function getDatasetPointLocation(
	page: Page,
	pointSpec: DatasetPointSpec,
	canvasOffset: CanvasOffset | null = null,
): Promise<Point2D> {
	return new Point2D(
		await page.evaluate(
			/* istanbul ignore next - fixes fatal errors when evaluating outside of original context, see https://github.com/istanbuljs/istanbuljs/issues/499#issuecomment-580358011 */
			({ dragPointSpec, canvasOffset }) => {
				const { x, y } = (window.test as any as Chart).getDatasetMeta(
					dragPointSpec.datasetIndex,
				).data[dragPointSpec.index];

				return {
					x: x + (canvasOffset?.left ?? 0),
					y: y + (canvasOffset?.top ?? 0),
				};
			},
			{ dragPointSpec: pointSpec, canvasOffset },
		),
	);
}
