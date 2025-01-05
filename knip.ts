import type { KnipConfig } from "knip";

const config: KnipConfig = {
	project: [
		"src/**/*.ts",
		"src/**/*.js",
		"src/**/*.tsx",
		"src/**/*.jsx",
		"scripts/*.ts",
		"scripts/*.js",
		"scripts/**/*.ts",
		"scripts/**/*.js",
	],
	ignoreDependencies: [
		"jest-mock", // false positive
		"@commitlint/config-conventional", // false positive
		"@types/config", // false positive
		"@types/ejs", // false positive
		"@vue/vue3-jest", // false positive
		"babel-jest", // false positive
		"canvas", // false positive
		"chartjs-adapter-date-fns", // false positive
		"chartjs-plugin-datalabels", // false positive
		"config", // false positive
		"date-fns", // false positive
		"ejs", // false positive
		"jest-environment-jsdom", // false positive
		"lint-staged", // false positive
		"node-sass", // false positive
		"resize-observer-polyfill", // false positive
		"rollup-plugin-copy", // false positive
		"ts-node", // false positive
		...(process.env.CI
			? [
					"lefthook-linux-x64", // false positive in CI
					"@rollup/rollup-linux-x64-gnu", // false positive in CI
				]
			: []),
	],
	ignore: ["src/util/typings.d.ts"],
};

export default config;
