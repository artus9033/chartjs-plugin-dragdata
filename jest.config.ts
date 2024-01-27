import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
	projects: [
		"<rootDir>/__tests__/unit/jest.unit.config.ts",
		"<rootDir>/__tests__/integration/jest.integration.config.ts",
	],
	testPathIgnorePatterns: [
		"**/__utils__",
		"**/__fixtures__",
		"**/__mocks__",
		"**/__config__",
	],
	setupFilesAfterEnv: ["<rootDir>/__tests__/__setup__/setup.ts"],
};

export default config;
