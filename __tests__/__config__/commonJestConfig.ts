import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
	preset: "ts-jest",
	testPathIgnorePatterns: [
		"__utils__",
		"__fixtures__",
		"__mocks__",
		"__config__",
		"node_modules",
	],
	setupFiles: ["jest-canvas-mock", "../__setup__/jestSetup.ts"],
	setupFilesAfterEnv: ["../__setup__/setup.ts"],
	extensionsToTreatAsEsm: [".ts"],
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{
				useESM: true,
			},
		],
	},
	testEnvironment: "jsdom",
	collectCoverageFrom: ["src/*.{js,ts,jsx,tsx}"],
	coverageReporters: ["lcov", "json"],
	coveragePathIgnorePatterns: ["node_modules/.*"],
};

export default config;
