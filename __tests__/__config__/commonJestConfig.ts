import { JestConfigWithTsJest } from "ts-jest";

const testPathIgnorePatterns: string[] = [
	"__utils__",
	"__fixtures__",
	"__mocks__",
	"__config__",
	"__data__",
	"node_modules",
];

const config: JestConfigWithTsJest = {
	preset: "ts-jest",
	testPathIgnorePatterns: testPathIgnorePatterns,
	setupFiles: ["jest-canvas-mock"],
	setupFilesAfterEnv: ["../__setup__/setup.ts", "../__setup__/jestSetup.ts"],
	extensionsToTreatAsEsm: [".ts"],
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				useESM: true,
			},
		],
		"^.+\\.vue$": "@vue/vue3-jest",
	},
	testEnvironment: "jsdom",
	testEnvironmentOptions: {
		customExportConditions: ["node", "node-addons"],
	},
	collectCoverageFrom: ["src/*.{js,ts,jsx,tsx}"],
	coverageReporters: ["lcov", "json"],
	coveragePathIgnorePatterns: testPathIgnorePatterns,
};

export default config;
