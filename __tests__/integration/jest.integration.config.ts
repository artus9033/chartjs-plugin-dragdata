import type { Config } from "jest";

import commonJestConfig from "../__config__/commonJestConfig";

const config: Config = {
	displayName: "integration",
	testMatch: ["**/*.spec.[jt]s?(x)"],
	...commonJestConfig,
};

export default config;
