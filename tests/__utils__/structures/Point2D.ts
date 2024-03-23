export type BoundingBox = {
	x: number;
	y: number;
	width: number;
	height: number;
};

class Point2D {
	public readonly x: number;
	public readonly y: number;

	constructor({ x, y }: { x: number; y: number }) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Creates a new Point2D instance with the the x and y values constrained to a given bounding box
	 * @param bb the bounding box to constrain the point to
	 * @returns a new Point2D instance with the x and y values constrained to the given bounding box
	 */
	copyConstrainedTo(bb: BoundingBox) {
		return new Point2D({
			x: Math.max(bb.x, Math.min(bb.x + bb.width, this.x)),
			y: Math.max(bb.y, Math.min(bb.y + bb.height, this.y)),
		});
	}

	toArray(): [x: number, y: number] {
		return [this.x, this.y];
	}

	toObject() {
		return {
			x: this.x,
			y: this.y,
		};
	}

	toString() {
		return `Point2D { x: ${Math.round(this.x * 10) / 10}, y: ${Math.round(this.y * 10) / 10} }`;
	}
}

export default Point2D;
