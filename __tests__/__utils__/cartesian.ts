import Point2D from "./Point2D";
import { AxisSpec } from "./axisSpec";

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
 * @returns the new point
 */
export function calcDragTargetPosition(
	pointA: Point2D,
	pointB: Point2D,
	whichAxis: AxisSpec,
): Point2D {
	if (whichAxis === "x") {
		// drag on the x axis
		return new Point2D({
			x: pointB.x,
			y: pointA.y,
		});
	} else {
		// drag on the y axis
		return new Point2D({
			x: pointA.x,
			y: pointB.y,
		});
	}
}
