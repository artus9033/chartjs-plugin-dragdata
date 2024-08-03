import Point2D, { BoundingBox } from "./structures/Point2D";
import { AxisSpec } from "./structures/axisSpec";

/**
 * Calculates the Euclidean distance between two points in a 2D space.
 * @param p1 the first point
 * @param p2 the second point
 * @returns the Euclidean distance between `p1` and `p2`
 */
export function euclideanDistance(p1: Point2D, p2: Point2D): number {
	return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

/**
 * Calculates the position of the drag target based on the axis being dragged to move either of
 * the coordinates of `pointA` to the corresponding coordinate of `pointB`.
 * @param pointA the source point
 * @param pointB the point to take one coordinate from
 * @param whichAxis the axis that determines which coordinate from `pointA` to substitute with the one from `pointB`
 * @param draggableAxis the axis/axes that is/are allowed to be dragged by chart config; if no axis is draggable, pass in `undefined`
 * @param canvasBB optionally the bounding box of the canvas, e.g. its `DOMRect`
 * @returns the new point, constrained to the `draggableAxis`
 */
export function calcDragTargetPosition(
	pointA: Point2D,
	pointB: Point2D,
	whichAxis: AxisSpec,
	draggableAxis?: AxisSpec,
	canvasBB?: BoundingBox,
): Point2D {
	let desiredPoint: Point2D;

	switch (whichAxis) {
		case "x":
			// drag desired to happen on the x axis
			desiredPoint = new Point2D({
				x: pointB.x,
				y: pointA.y,
			});
			break;

		case "y":
			// drag desired to happen on the y axis
			desiredPoint = new Point2D({
				x: pointA.x,
				y: pointB.y,
			});
			break;

		case "both":
			// drag desired to happen on both axes
			desiredPoint = new Point2D({ x: pointB.x, y: pointB.y });
			break;

		default:
			throw new Error(`Unknown whichAxis: ${whichAxis}`);
	}

	switch (draggableAxis) {
		case "x":
			// constrain the drag to the x axis
			desiredPoint = new Point2D({ x: desiredPoint.x, y: pointA.y });
			break;

		case "y":
			// constrain the drag to the y axis
			desiredPoint = new Point2D({ x: pointA.x, y: desiredPoint.y });
			break;

		case "both":
			// no constraints
			break;

		case undefined:
			// no axis is draggable
			desiredPoint = new Point2D({ x: pointA.x, y: pointA.y });
			break;

		default:
			throw new Error(`Unknown draggableAxis: ${draggableAxis}`);
	}

	if (canvasBB) {
		desiredPoint = desiredPoint.copyConstrainedTo(canvasBB);
	}

	return desiredPoint;
}
