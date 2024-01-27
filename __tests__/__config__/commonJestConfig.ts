import { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	extensionsToTreatAsEsm: [".ts"],
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				useESM: true,
			},
		],
	},
	testEnvironment: "jsdom",
	setupFiles: ["jest-canvas-mock", "../__setup__/jestSetup.ts"],
};

export default config;
