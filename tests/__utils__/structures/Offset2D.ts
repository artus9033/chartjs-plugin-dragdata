import Point2D from "./Point2D";

class Offset2D {
	public readonly x: number | undefined;
	public readonly y: number | undefined;
	public readonly xRelative: number | undefined;
	public readonly yRelative: number | undefined;

	constructor({
		x,
		y,
		xRelative,
		yRelative,
	}:
		| {
				/** absolute offset in px on the X axis */
				x: number;
				/** absolute offset in px on the Y axis */
				y: number;
				xRelative?: never;
				yRelative?: never;
		  }
		| {
				x?: never;
				y?: never;
				/** relative normalized (`0` to `1`) offset of an arbitrary value to be handled elsewhere on the X axis */
				xRelative: number;
				/** relative normalized (`0` to `1`) offset of an arbitrary value to be handled elsewhere on the Y axis */
				yRelative: number;
		  }) {
		this.x = x;
		this.y = y;
		this.xRelative = xRelative;
		this.yRelative = yRelative;
	}

	/**
	 * Translates a point by the offset
	 *
	 * **NOTE**: the coordinates of this offset are counted in cartesian plane where `(0, 0)` is located
	 * in the bottom-left corner, contrary to the HTML window coordinates, where `(0, 0)` is in the top-left corner
	 * @param point the point to translate
	 * @returns the translated point by this offset
	 */
	translatePoint(point: Point2D): Point2D {
		return new Point2D({
			x: point.x - (this.x ?? this.xRelative! * point.x),
			y: point.y - (this.y ?? this.yRelative! * point.y),
		});
	}

	toObject() {
		return {
			x: this.x,
			y: this.y,
			xRelative: this.xRelative,
			yRelative: this.yRelative,
		};
	}

	toString() {
		return `Offset2D { x: ${this.x === undefined ? `rel. ${Math.round(this.xRelative! * 100)}%` : `abs. ${Math.round(this.x * 100) / 100}`}, y: ${this.y === undefined ? `rel. ${Math.round(this.yRelative! * 100)}%` : `abs. ${Math.round(this.y * 100) / 100}`} }`;
	}
}

export default Offset2D;
