class Point2D {
	public x: number;
	public y: number;

	constructor({ x, y }: { x: number; y: number }) {
		this.x = x;
		this.y = y;
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
		return `Point2D { x: ${Math.round(this.x * 10)}, y: ${Math.round(this.y * 10) / 10} }`;
	}
}

export default Point2D;
