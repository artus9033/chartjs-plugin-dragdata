import type { Page } from "playwright";
import { expect } from "playwright-test-coverage";

import Point2D from "../../__utils__/Point2D";
import { calcDragTargetPosition } from "../../__utils__/cartesian";
import { AxisSpec, DatasetPointSpec } from "../../__utils__/testTypes";
import {
	calcCanvasOffset,
	getDatasetPointLocation,
} from "../__utils__/chartUtils";
import { bootstrapTest } from "./misc";

export async function expectDragSuccessful(
	page: Page,
	dragPointSpec: DatasetPointSpec,
	destRefPointOrSpec: DatasetPointSpec | Point2D,
	fileName: string,
	whichAxis: AxisSpec,
) {
	await bootstrapTest(page, fileName);

	const canvasOffset = await calcCanvasOffset(page);

	let dragStartPoint: Point2D = await getDatasetPointLocation(
			page,
			dragPointSpec,
			canvasOffset,
		),
		dragRefPoint: Point2D =
			destRefPointOrSpec instanceof Point2D
				? destRefPointOrSpec
				: await getDatasetPointLocation(page, destRefPointOrSpec, canvasOffset),
		dragDestPoint = calcDragTargetPosition(
			dragStartPoint,
			dragRefPoint,
			whichAxis,
		);

	// console.log(`Dragging from ${dragStartPoint} to ${dragDestPoint}`);

	// perform the dragging gesture
	await page.mouse.move(...dragStartPoint.toArray());
	await page.mouse.down();
	await page.mouse.move(...dragDestPoint.toArray());
	await page.mouse.up();

	// check if the values match after dragging
	const actualNewDraggedPointLocation = await getDatasetPointLocation(
		page,
		dragPointSpec,
	);

	expect(actualNewDraggedPointLocation).pointsToBeClose(dragDestPoint);
}
