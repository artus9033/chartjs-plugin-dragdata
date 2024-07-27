import { Config } from "jest";

import commonJestConfig from "../__config__/commonJestConfig";

const config: Config = {
	...commonJestConfig,
	displayName: "unit",
	testMatch: ["**/*.spec.[jt]s?(x)"],
};

export default config;
