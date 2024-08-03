class Whitelist<T> {
	private arr: Array<T> | null;

	constructor(whitelist: T[] | null | undefined) {
		this.arr = whitelist?.length ? new Array<T>(...whitelist) : null;
	}

	push(...args: T[]) {
		if (!this.arr) {
			this.arr = new Array();
		}

		this.arr.push(...args);
	}

	/** Returns `true` if the whitelist is non-empty and contains
	 * the `searchElement` or `false` in every other case
	 * @param searchElement The element to check if is allowed
	 * @returns `true` if the `searchElement` is found in the whitelist; `false` otherwise
	 * */
	isAllowed(searchElement: T): boolean {
		if (this.arr === null) {
			return true;
		} else {
			return this.arr.includes(searchElement);
		}
	}

	toString(): string {
		return `Whitelist { ${this.arr === null ? "empty - all allowed" : this.arr.join(", ")} }`;
	}
}

export default Whitelist;
