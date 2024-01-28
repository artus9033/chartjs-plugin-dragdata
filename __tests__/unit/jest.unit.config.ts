import { JestConfigWithTsJest } from "ts-jest";

import commonJestConfig from "../__config__/commonJestConfig";

const config: JestConfigWithTsJest = {
	displayName: "unit",
	testMatch: ["**/*.spec.[jt]s?(x)"],
	...commonJestConfig,
};

export default config;
