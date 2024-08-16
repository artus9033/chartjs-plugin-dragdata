export function roundValue(value: number, pos: number | undefined) {
	if (pos === undefined || isNaN(pos) || pos < 0) return value;

	return Math.round(value * Math.pow(10, pos)) / Math.pow(10, pos);
}
