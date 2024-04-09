import type { BubbleDataPoint, Point } from "chart.js";

type CoordType = Point | BubbleDataPoint;
export type MagnetFunction = <T extends number | CoordType>(value: T) => T;

export const roundToInteger: MagnetFunction = (value) => {
	const scalarRound = (value: number) => Math.round(value);

	if (typeof value === "number") {
		return scalarRound(value) as any;
	} else {
		return {
			...(value as CoordType),
			x: scalarRound(value.x),
			y: scalarRound(value.y),
		} as any;
	}
};

export const roundToFirstDecimalPlace: MagnetFunction = (value) => {
	const scalarRound = (value: number) => Math.round(value * 10) / 10;

	if (typeof value === "number") {
		return scalarRound(value) as any;
	} else {
		return {
			...(value as CoordType),
			x: scalarRound(value.x),
			y: scalarRound(value.y),
		} as any;
	}
};

export type MagnetVariant = "none" | "toInteger" | "toFirstDecimalPlace";

export const ALL_TESTED_MAGNET_VARIANTS: MagnetVariant[] = [
	"none",
	"toInteger",
	"toFirstDecimalPlace",
];

/** specifies magnet function implementations for each of magnet variants */
export const MagnetImplementations: Record<
	Exclude<MagnetVariant, "none">,
	MagnetFunction
> & { none: undefined } = {
	none: undefined,
	toInteger: roundToInteger,
	toFirstDecimalPlace: roundToFirstDecimalPlace,
};

/** describes the errors that may occur when rounding the value for each of magnet variants */
export const MagnetEstimatedErrors: Record<MagnetVariant, number> = {
	none: 0,
	toInteger: 1,
	toFirstDecimalPlace: 0.1,
};
