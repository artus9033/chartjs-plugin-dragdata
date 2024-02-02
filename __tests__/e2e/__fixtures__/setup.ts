import { test } from "@playwright/test";

import { bootstrapTest } from "./misc";

export async function setupTests({
	fileName,
	disablePlugin = false,
}: {
	fileName: string;
	disablePlugin?: boolean;
}) {
	test.beforeEach(async ({ page }, testInfo) => {
		testInfo.snapshotSuffix = ""; // disable per-platform screenshot snapshots

		await bootstrapTest(page, { fileName, disablePlugin });
	});
}
