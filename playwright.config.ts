import "./tests/e2e/__setup__/playwrightSetup";

import path from "path";

import { Project, defineConfig, devices } from "@playwright/test";

import { isWhitelistItemAllowed } from "./tests/__utils__/testsConfig";

function hasGUI() {
	if (process.argv.includes("--headed") || process.argv.includes("--ui"))
		process.env.HEADED_MODE = "1";

	return Boolean(process.env.HEADED_MODE);
}

if (hasGUI()) {
	console.log(
		"Running in UI mode - testing will only happen on Chrome, regardless of YAML configuration",
	);
}

const chromeRunner: Project = {
		name: "Chrome",
		use: { ...devices["Desktop Chrome"], channel: "chrome" },
	},
	allAvailableRunners = [
		chromeRunner,
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
		{
			name: "Mobile Chrome",
			use: { ...devices["Pixel 5"] },
		},
		{
			name: "Mobile Safari",
			use: { ...devices["iPhone 12"] },
		},
	];

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
	projects:
		/* Test against desktop browsers */
		(hasGUI()
			? [chromeRunner]
			: allAvailableRunners.filter(({ name }) =>
					isWhitelistItemAllowed("e2e", "whitelistedBrowsers", name!),
				)
		).map((project) => ({ ...project, fullyParallel: true })),
	testMatch: path.join(path.dirname(__filename), "tests", "e2e", "*.spec.ts"),
	globalSetup: path.join(
		path.dirname(__filename),
		"tests",
		"e2e",
		"__setup__",
		"playwrightGlobalSetup.ts",
	),
	outputDir: path.join(path.dirname(__filename), "tests", "e2e", "__results__"),
});
