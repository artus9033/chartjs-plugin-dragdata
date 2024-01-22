import type { Config } from "jest";

const config: Config = {
	displayName: "unit",
	testMatch: ["**/__tests__/**/unit/**/*.[jt]s?(x)"],
};

export default config;
