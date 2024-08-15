import { Config } from "jest";

export const testPathIgnorePatterns: string[] = [
	"__utils__",
	"__fixtures__",
	"__mocks__",
	"__config__",
	"__data__",
	"__setup__",
	"__data__",
	"scripts",
	"node_modules",
	"dist",
];

const config: Config = {
	testPathIgnorePatterns: testPathIgnorePatterns,
	setupFilesAfterEnv: ["../__setup__/jestSetup.ts"],
	globalSetup: "../__setup__/jestGlobalSetup.ts",
	transform: {
		"^.+\\.[t|j]sx?$": [
			"babel-jest",
			{ configFile: "<rootDir>/../../babel.config.js" },
		],
		"^.+\\.vue$": "@vue/vue3-jest",
	},
	transformIgnorePatterns: ["node_modules/(?!d3-*)"],
	testEnvironment: "jsdom",
	testEnvironmentOptions: {
		customExportConditions: ["node", "node-addons"],
	},
};

export default config;
