import type { ChartData, ChartMeta } from "chart.js";
import { Point } from "chart.js/dist/core/core.controller";

import { ArrayItemType } from "../e2e/__utils__/types";
import Point2D from "./Point2D";
import type { DatasetPointSpec } from "./testTypes";

export type CanvasOffset = { left: number; top: number };

type DataItem = NonNullable<
	ArrayItemType<ArrayItemType<ChartData>["datasets"]>
>;
export type GetChartDatasetMetaFunc = (
	datasetIndex: number,
) => Promise<ChartMeta> | ChartMeta;

export async function getDatasetPointLocation(
	getChartDatasetMeta: GetChartDatasetMetaFunc,
	pointSpec: DatasetPointSpec,
	canvasOffset: CanvasOffset | null = null,
): Promise<Point2D> {
	const dataPositionsOnCanvas = (
			await getChartDatasetMeta(pointSpec.datasetIndex)
		).data,
		{ x, y } = dataPositionsOnCanvas[pointSpec.index];

	return new Point2D({
		x: x + (canvasOffset?.left ?? 0),
		y: y + (canvasOffset?.top ?? 0),
	});
}
