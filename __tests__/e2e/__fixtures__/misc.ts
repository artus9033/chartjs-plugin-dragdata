import type { Page } from "playwright";

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function bootstrapTest(
	page: Page,
	{
		fileName,
		disablePlugin = false,
	}: { fileName: string; disablePlugin?: boolean },
) {
	await page.goto(
		`file://${__dirname}/../../../docs/${fileName}.html?isTest=true&disablePlugin=${disablePlugin ? "true" : "false"}`,
	);
	await page.waitForLoadState("load");
}
