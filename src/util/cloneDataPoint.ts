import type { ChartType } from "chart.js";

import { ChartDataItemType } from "../types";

export function cloneDataPoint<
	TType extends ChartType,
	T = ChartDataItemType<TType>,
>(source: T): T {
	if (Array.isArray(source)) return [...source] as T;
	else if (typeof source === "object") return { ...source };

	// below: typeof source === "number"
	return source;
}
