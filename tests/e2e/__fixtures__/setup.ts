import { test } from "@playwright/test";

import { BootstrapTestOptions, bootstrapTest } from "./misc";

export async function setupTests(options: BootstrapTestOptions) {
	test.beforeEach(async ({ page }, testInfo) => {
		testInfo.snapshotSuffix = ""; // disable per-platform screenshot snapshots

		await bootstrapTest(page, options);
	});
}
