import "../__setup__/setup";

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
	projects: [
		/* Test against desktop browsers */
		{
			name: "Chrome",
			use: { ...devices["Desktop Chrome"], channel: "chrome" },
		},
		// {
		// 	name: "Firefox",
		// 	use: { ...devices["Desktop Firefox"] },
		// },
		// {
		// 	name: "Safari",
		// 	use: { ...devices["Desktop Safari"] },
		// },
		// {
		// 	name: "Microsoft Edge",
		// 	use: { ...devices["Desktop Edge"], channel: "msedge" },
		// },
		// /* Test against mobile viewports. */
		// {
		// 	name: "Mobile Chrome",
		// 	use: { ...devices["Pixel 5"] },
		// },
		// {
		// 	name: "Mobile Safari",
		// 	use: { ...devices["iPhone 12"] },
		// },
	],
	testMatch: path.join(path.dirname(__filename), "*.spec.ts"),
	globalSetup: path.join(
		path.dirname(__filename),
		"..",
		"__setup__",
		"setup.ts",
	),
	outputDir: path.join(path.dirname(__filename), "__results__"),
});
