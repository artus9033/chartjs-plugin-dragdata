/**
 * Clips a value between a minimum and maximum value.
 * @param value the value to be clipped
 * @param min the minimum value
 * @param max the maximum value
 * @returns value in range [min, max]
 */
export function clipValue(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}
