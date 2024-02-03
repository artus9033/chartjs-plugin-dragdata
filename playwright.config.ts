import "./__tests__/__setup__/setup";
import "./__tests__/e2e/__setup__/playwrightSetup";

import path from "path";

import { defineConfig, devices } from "@playwright/test";

function hasGUI() {
	if (process.argv.includes("--headed") || process.argv.includes("--ui"))
		process.env.HEADED_MODE = "1";

	return Boolean(process.env.HEADED_MODE);
}

export default defineConfig({
	use: {
		launchOptions: {
			slowMo: hasGUI() ? 650 : undefined,
		},
		video: "retain-on-failure",
		trace: "off",
	},
	workers: "50%",
	maxFailures: process.env.ci ? undefined : 1,
	projects: [
		/* Test against desktop browsers */
		{
			name: "Chrome",
			use: { ...devices["Desktop Chrome"], channel: "chrome" },
		},
		...(hasGUI()
			? []
			: [
					{
						name: "Firefox",
						use: { ...devices["Desktop Firefox"] },
					},
					{
						name: "Safari",
						use: { ...devices["Desktop Safari"] },
					},
					{
						name: "Microsoft Edge",
						use: { ...devices["Desktop Edge"], channel: "msedge" },
					},
					/* Test against mobile viewports. */
					{
						name: "Mobile Chrome",
						use: { ...devices["Pixel 5"] },
					},
					{
						name: "Mobile Safari",
						use: { ...devices["iPhone 12"] },
					},
				]),
	].map((project) => ({ ...project, fullyParallel: true })),
	testMatch: path.join(
		path.dirname(__filename),
		"__tests__",
		"e2e",
		"*.spec.ts",
	),
	globalSetup: path.join(
		path.dirname(__filename),
		"__tests__",
		"e2e",
		"__setup__",
		"playwrightGlobalSetup.ts",
	),
	outputDir: path.join(
		path.dirname(__filename),
		"__tests__",
		"e2e",
		"__results__",
	),
});
