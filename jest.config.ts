import type { Config } from "jest";

const config: Config = {
	projects: [
		"<rootDir>/__tests__/__config__/jest.unit.config.ts",
		"<rootDir>/__tests__/__config__/jest.integration.config.ts",
	],
	transform: {
		"^.+\\.tsx?$": "ts-jest",
	},
	testPathIgnorePatterns: [
		"**/__utils__",
		"**/__fixtures__",
		"**/__mocks__",
		"**/__config__",
	],
	setupFilesAfterEnv: ["<rootDir>/__tests__/__setup__/setup.ts"],
};

export default config;
