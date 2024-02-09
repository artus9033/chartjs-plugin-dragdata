import type { Chart } from "chart.js";

import Offset2D from "./structures/Offset2D";
import Point2D from "./structures/Point2D";
import type { DatasetPointSpec } from "./testTypes";

export type GetChartDatasetSamplePixelPositionFunc = (
	datasetIndex: number,
	sampleIndex: number,
) => Promise<Point2D> | Point2D;

export type GetChartScalesFunc = () =>
	| Promise<Chart["scales"]>
	| Chart["scales"];

/**
 * Function to get the location of a point on the canvas by its specs (w.r.t. the dataset) on the screen
 * @param getChartDatasetSamplePixelPosition function returning the position ({@see {Point2D}}) of the specified dataset sample
 * @param pointSpec specification on which dataset and which point to get the location of
 * @param canvasBB the bounding box of the canvas
 * @returns the coordinates of the point on the screen
 */
export async function getDatasetPointLocationOnScreen(
	getChartDatasetSamplePixelPosition: GetChartDatasetSamplePixelPositionFunc,
	pointSpec: DatasetPointSpec,
	canvasBB: DOMRect | null = null,
): Promise<Point2D> {
	const positionOnCanvas = await getChartDatasetSamplePixelPosition(
		pointSpec.datasetIndex,
		pointSpec.index,
	);

	return new Offset2D({
		x: canvasBB?.left ?? 0,
		y: canvasBB?.top ?? 0,
	}).translatePoint(positionOnCanvas);
}
