import type { Config } from "jest";

// since jest projects don't inherit from root config, we instead use tests/__config__/commonJestConfig.ts
// thus, here we want just to define projects' configs; see https://github.com/jestjs/jest/issues/10991
const config: Pick<Config, "projects"> = {
	projects: [
		"<rootDir>/tests/unit/jest.unit.config.ts",
		"<rootDir>/tests/integration/jest.integration.config.ts",
	],
};

export default config;
