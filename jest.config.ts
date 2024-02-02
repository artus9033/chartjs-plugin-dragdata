import type { Config } from "jest";

// since jest projects don't inherit from root config, we instead use __tests__/__config__/commonJestConfig.ts
// thus, here we want just to define projects' configs; see https://github.com/jestjs/jest/issues/10991
const config: Pick<Config, "projects"> = {
	projects: [
		"<rootDir>/__tests__/unit/jest.unit.config.ts",
		"<rootDir>/__tests__/integration/jest.integration.config.ts",
	],
};

export default config;
