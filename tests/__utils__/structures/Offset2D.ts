import Point2D from "./Point2D";

export type Offset2DScale = { x: number; y: number };

type Offset2DParameters = {
	/** absolute offset in px (or other unit, e.g. value of chart) on the X axis */
	xAbs?: number;
	/** absolute offset in px (or other unit, e.g. value of chart) on the Y axis */
	yAbs?: number;
	/** relative normalized (`0` to `1`) offset of an arbitrary value to be handled elsewhere on the X axis */
	xRelative?: number;
	/** relative normalized (`0` to `1`) offset of an arbitrary value to be handled elsewhere on the Y axis */
	yRelative?: number;
	/** additional flag that can be utilized for external means */
	shouldBeLogged?: boolean;
	/** whether scaledCopy() has any effect */
	scalable?: boolean;
};

type Offset2DOptions = Partial<{
	nonScalableParameters: Array<keyof Offset2DParameters>;
}>;

/**
 * Represents a 2D offset (relative to the values of a given point or absolute in an arbitrary unit) in a cartesian plane
 *
 * **NOTE**: the coordinates of this offset are counted in cartesian plane where `(0, 0)` is located
 * in the bottom-left corner, contrary to the HTML window coordinates, where `(0, 0)` is in the top-left corner
 */
class Offset2D {
	public readonly xAbs: number | undefined;
	public readonly yAbs: number | undefined;
	public readonly xRelative: number | undefined;
	public readonly yRelative: number | undefined;
	public readonly shouldBeLogged: boolean;
	public readonly scalable: boolean;

	constructor(
		{
			xAbs,
			yAbs,
			xRelative,
			yRelative,
			shouldBeLogged = true,
			scalable = true,
		}: Offset2DParameters,
		private options?: Offset2DOptions,
	) {
		this.xAbs = xAbs;
		this.yAbs = yAbs;
		this.xRelative = xRelative;
		this.yRelative = yRelative;
		this.shouldBeLogged = shouldBeLogged;
		this.scalable = scalable;
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
			x: point.x - ((this.xAbs ?? 0) + (this.xRelative ?? 0) * point.x),
			y: point.y - ((this.yAbs ?? 0) + (this.yRelative ?? 0) * point.y),
		});
	}

	/**
	 * Returns a plain object (POJO) representation of this instance
	 * @returns the POJO
	 */
	toObject() {
		return {
			x: this.xAbs,
			y: this.yAbs,
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
		if (this.scalable) {
			return new Offset2D({
				xAbs: this.options?.nonScalableParameters?.includes("xAbs")
					? this.xAbs
					: this.xAbs === undefined
						? undefined
						: this.xAbs * scale.x,
				yAbs: this.options?.nonScalableParameters?.includes("yAbs")
					? this.yAbs
					: this.yAbs === undefined
						? undefined
						: this.yAbs * scale.y,
				xRelative: this.options?.nonScalableParameters?.includes("xRelative")
					? this.xRelative
					: this.xRelative === undefined
						? undefined
						: this.xRelative * scale.x,
				yRelative: this.options?.nonScalableParameters?.includes("yRelative")
					? this.yRelative
					: this.yRelative === undefined
						? undefined
						: this.yRelative * scale.y,
			});
		} else {
			return new Offset2D(this);
		}
	}

	summedCopy(offset: Offset2D): Offset2D {
		return new Offset2D({
			xAbs: (this.xAbs ?? 0) + (offset.xAbs ?? 0),
			yAbs: (this.yAbs ?? 0) + (offset.yAbs ?? 0),
			xRelative: (this.xRelative ?? 0) + (offset.xRelative ?? 0),
			yRelative: (this.yRelative ?? 0) + (offset.yRelative ?? 0),
			shouldBeLogged: this.shouldBeLogged || offset.shouldBeLogged,
			scalable:
				this.scalable === false || offset.scalable === false ? false : true,
		});
	}

	toString() {
		return `Offset2D { x abs. ${this.xAbs ?? 0}, x rel. ${Math.round((this.xRelative ?? 0) * 100)}%, y abs. ${this.yAbs ?? 0}, y rel. ${Math.round((this.yRelative ?? 0) * 100)}% }`;
	}
}

export default Offset2D;
