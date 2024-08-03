export type AxisSpec = "x" | "y" | "both";

export const ALL_AXES_SPECS: AxisSpec[] = ["both", "x", "y"];

export function getAxisDescription(axis: AxisSpec) {
	switch (axis) {
		default:
			return "???";

		case "x":
			return "x-axis";

		case "y":
			return "y-axis";

		case "both":
			return "both axes";
	}
}
