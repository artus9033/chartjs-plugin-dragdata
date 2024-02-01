import type { Chart, ChartMeta } from "chart.js";

import Point2D from "./Point2D";
import type { DatasetPointSpec } from "./testTypes";

export type CanvasOffset = { left: number; top: number };

export async function getDatasetPointLocation(
	getChartDatasetMeta: (
		datasetIndex: number,
	) => Promise<ChartMeta<"line">> | ChartMeta<"line">,
	pointSpec: DatasetPointSpec,
	canvasOffset: CanvasOffset | null = null,
): Promise<Point2D> {
	const { x, y } = (await getChartDatasetMeta(pointSpec.datasetIndex)).data[
		pointSpec.index
	];

	return new Point2D({
		x: x + (canvasOffset?.left ?? 0),
		y: y + (canvasOffset?.top ?? 0),
	});
}
