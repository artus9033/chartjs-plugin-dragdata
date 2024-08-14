import type { Config } from "jest";

import { testPathIgnorePatterns } from "./tests/__config__/commonJestConfig";

// since jest projects don't inherit from root config, we instead use tests/__config__/commonJestConfig.ts
// thus, here we want just to define projects' configs; see https://github.com/jestjs/jest/issues/10991
const config: Pick<
	Config,
	| "projects"
	| "coverageReporters"
	| "collectCoverageFrom"
	| "coveragePathIgnorePatterns"
> = {
	projects: [
		"<rootDir>/tests/unit/jest.unit.config.ts",
		"<rootDir>/tests/integration/jest.integration.config.ts",
	],
	collectCoverageFrom: ["src/*.{js,ts,jsx,tsx}"],
	coverageReporters: ["lcov", "json"],
	coveragePathIgnorePatterns: testPathIgnorePatterns,
};

export default config;
