import path from "path";

import type { Page } from "playwright";

import { AxisSpec } from "../../__utils__/structures/axisSpec";

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export type BootstrapTestOptions = {
	fileName: string;
	draggableAxis: AxisSpec;
	disablePlugin?: boolean;
};

function encodeOption(optionValue: string | boolean): string {
	switch (typeof optionValue) {
		case "string":
			return optionValue;
		case "boolean":
			return optionValue ? "true" : "false";
		default:
			throw new Error("Unsupported option type");
	}
}

export async function bootstrapTest(page: Page, options: BootstrapTestOptions) {
	options.disablePlugin = options.disablePlugin ?? false;

	const urlSearchParams = new URLSearchParams({
		isTest: "true",
	});

	for (const key of Object.keys(options)) {
		if (key === "fileName") continue;

		urlSearchParams.append(
			key,
			encodeOption(options[key as any as keyof BootstrapTestOptions]!),
		);
	}

	await page.goto(
		`file://${path.dirname(__filename)}/../../../demos/dist/${options.fileName}?${urlSearchParams.toString()}`,
	);
	await page.waitForLoadState("load");
	// since the plugin script is lazily loaded based on URL search params,
	// the below is to stably check whether the page is ready for real
	await page.waitForFunction(() => window.isTestReady);
}
