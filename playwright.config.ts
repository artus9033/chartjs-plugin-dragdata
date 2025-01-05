import "./tests/e2e/__setup__/playwrightSetup";

import path from "path";

import { Project, defineConfig, devices } from "@playwright/test";

import { Signale } from "signale";
import { isTestsConfigWhitelistItemAllowed } from "./tests/__utils__/testsConfig";
import { hasGUI } from "./tests/e2e/__utils__/testHelpers";

const signale = new Signale({
	scope: "playwright.config.ts",
});

if (hasGUI()) {
	signale.info(
		"Running in UI mode - testing will only happen on Chrome, regardless of YAML configuration",
	);
}

const allAvailableRunners: Project[] = [
	{
		name: "Chrome",
		use: { ...devices["Desktop Chrome"], channel: "chrome" },
	},
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
			slowMo: hasGUI() ? 550 : undefined,
		},
		video: "retain-on-failure",
		trace: "off",
	},
	workers: "50%",
	maxFailures: process.env.ci ? undefined : 10,
	retries: 2,
	projects: allAvailableRunners.filter(({ name }) =>
		isTestsConfigWhitelistItemAllowed("e2e", "whitelistedBrowsers", name!),
	),
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
