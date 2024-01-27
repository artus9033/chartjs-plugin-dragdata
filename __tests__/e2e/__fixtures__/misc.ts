import type { Page } from "playwright";

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function bootstrapTest(page: Page, fileName: string) {
	await page.goto(
		`file://${__dirname}/../../../docs/${fileName}.html?isTest=true`,
	);
	await page.waitForLoadState("load");
}
