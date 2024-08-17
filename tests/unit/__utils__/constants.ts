import { ChartType } from "chart.js";
import { ArrayItemType } from "../../__utils__/types";

export const UNIT_TEST_CHART_TYPES = [
	"line",
	"bar",
	"scatter",
	"bubble",
	"polarArea",
	"radar",
] satisfies Array<ChartType>;

export type TestChartTypes = ArrayItemType<typeof UNIT_TEST_CHART_TYPES>;
