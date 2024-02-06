import type { Chart, ChartMeta } from "chart.js";

import Point2D from "./structures/Point2D";
import type { DatasetPointSpec } from "./testTypes";

export type GetChartDatasetMetaFunc = (
	datasetIndex: number,
) => Promise<ChartMeta> | ChartMeta;

export type GetChartScalesFunc = () =>
	| Promise<Chart["scales"]>
	| Chart["scales"];

/**
 * Function to get the location of a point on the canvas by its specs (w.r.t. the dataset) on the screen
 * @param getChartDatasetMeta function returning the {@see {`DatasetMeta`}} of the chart instance
 * @param pointSpec specification on which dataset and which point to get the location of
 * @param canvasBB the bounding box of the canvas
 * @returns the coordinates of the point on the screen
 */
export async function getDatasetPointLocationOnScreen(
	getChartDatasetMeta: GetChartDatasetMetaFunc,
	pointSpec: DatasetPointSpec,
	canvasBB: DOMRect | null = null,
): Promise<Point2D> {
	const dataPositionsOnCanvas = (
			await getChartDatasetMeta(pointSpec.datasetIndex)
		).data,
		{ x, y } = dataPositionsOnCanvas[pointSpec.index];

	return new Point2D({
		x: x + (canvasBB?.left ?? 0),
		y: y + (canvasBB?.top ?? 0),
	});
}
