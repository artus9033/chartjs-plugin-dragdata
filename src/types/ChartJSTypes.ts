import type { ChartType, DefaultDataPoint } from "chart.js";

export type ChartDataItemType<TType extends ChartType> =
	DefaultDataPoint<TType>[0];
