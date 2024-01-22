import type { Config } from "jest";

const config: Config = {
	displayName: "integration",
	testMatch: ["**/__tests__/**/integration/**/*.[jt]s?(x)"],
};

export default config;
