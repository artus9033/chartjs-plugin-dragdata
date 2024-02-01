import { JestConfigWithTsJest } from "ts-jest";

import commonJestConfig from "../__config__/commonJestConfig";

const config: JestConfigWithTsJest = {
	...commonJestConfig,
	displayName: "unit",
	testMatch: ["**/*.spec.[jt]s?(x)"],
};

export default config;
