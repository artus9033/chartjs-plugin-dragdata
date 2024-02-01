import { JestConfigWithTsJest } from "ts-jest";

import commonJestConfig from "../__config__/commonJestConfig";

const config: JestConfigWithTsJest = {
	...commonJestConfig,
	displayName: "integration",
	testMatch: ["**/*.spec.[jt]s?(x)"],
};

export default config;
