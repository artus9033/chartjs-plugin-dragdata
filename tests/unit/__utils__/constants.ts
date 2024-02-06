import { ChartTypeRegistry } from "chart.js";
import { ArrayItemType } from "../../e2e/__utils__/types";

export const UNIT_TEST_CHART_TYPES = [
	"line",
	"bar",
	"scatter",
	"bubble",
	"polarArea",
	"radar",
] satisfies Array<keyof ChartTypeRegistry>;

export type TestChartTypes = ArrayItemType<typeof UNIT_TEST_CHART_TYPES>;
