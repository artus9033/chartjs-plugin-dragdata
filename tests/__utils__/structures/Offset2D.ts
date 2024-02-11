import Point2D from "./Point2D";

export type Offset2DScale = { x: number; y: number };

/**
 * Represents a 2D offset (relative to the values of a given point or absolute in an arbitrary unit) in a cartesian plane
 */
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
				/** absolute offset in px (or other unit, e.g. value of chart) on the X axis */
				x: number;
				/** absolute offset in px (or other unit, e.g. value of chart) on the Y axis */
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

	/**
	 * Returns a plain object (POJO) representation of this instance
	 * @returns the POJO
	 */
	toObject() {
		return {
			x: this.x,
			y: this.y,
			xRelative: this.xRelative,
			yRelative: this.yRelative,
		};
	}

	/**
	 * Returns a new `Offset2D` instance with the same values, but scaled by the given `scale`
	 * @param scale the scale to apply
	 * @returns the scaled offset (new instance)
	 */
	scaledCopy(scale: Offset2DScale): Offset2D {
		if (this.x !== undefined) {
			return new Offset2D({
				x: this.x * scale.x,
				y: this.y! * scale.x,
			});
		} else {
			return new Offset2D({
				x: this.xRelative! * scale.x,
				y: this.yRelative! * scale.y,
			});
		}
	}

	toString() {
		return `Offset2D { x: ${this.x === undefined ? `rel. ${Math.round(this.xRelative! * 100)}%` : `abs. ${this.x}`}, y: ${this.y === undefined ? `rel. ${Math.round(this.yRelative! * 100)}%` : `abs. ${this.y}`} }`;
	}
}

export default Offset2D;
