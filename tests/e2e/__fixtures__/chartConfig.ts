import type { Chart, ChartOptions, ChartTypeRegistry } from "chart.js";
import _ from "lodash";
import type { Page } from "playwright";

import { DeepPartial } from "../__utils__/types";

export async function applyConfig<
	TType extends keyof ChartTypeRegistry,
	BMerge extends "merge" | "replace" = "merge",
>(
	page: Page,
	options: BMerge extends "merge"
		? DeepPartial<ChartOptions<TType>>
		: ChartOptions<TType>,
	mode?: BMerge,
) {
	await page.evaluate(() => {
		let chart = window.test as any as Chart;
		if (mode === "merge" || mode === undefined) {
			chart.options = _.merge(chart.options, options);
		} else {
			chart.options = options as any;
		}

		chart.update();
	});
}
