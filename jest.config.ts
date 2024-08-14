import type { Config } from "jest";

import { testPathIgnorePatterns } from "./tests/__config__/commonJestConfig";

/**
 * Since jest projects don't inherit all properties from root config, we instead use tests/__config__/commonJestConfig.ts
 * thus, here we want just to define projects' configs; see https://github.com/jestjs/jest/issues/10991.
 * Also, as some options are not allowed in project configs, but only in the global config, they are specified here; see https://github.com/jestjs/jest/issues/13576.
 */

const config: Config = {
	projects: [
		"<rootDir>/tests/unit/jest.unit.config.ts",
		"<rootDir>/tests/integration/jest.integration.config.ts",
	],
	collectCoverageFrom: ["src/*.{js,ts,jsx,tsx}"],
	coverageReporters: ["lcov", "json"],
	coveragePathIgnorePatterns: testPathIgnorePatterns,
	verbose: true,
};

export default config;
