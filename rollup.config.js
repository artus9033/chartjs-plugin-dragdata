const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve");
const terser = require("@rollup/plugin-terser");
const istanbul = require("rollup-plugin-istanbul");
const copy = require("rollup-plugin-copy");
const replace = require("@rollup/plugin-replace");
const typescript = require("@rollup/plugin-typescript");

const pkg = require("./package.json");

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.repository.url}
 * (c) 2018-${new Date().getFullYear()} ${pkg.name} contributors
 * Released under the ${pkg.license} license
 */`;

/**
 *	Create a rollup configuration for a given file
 * @param {string} file the input file
 * @param {import("rollup").ModuleFormat} format the format of the output module
 * @param {boolean} terse whether to run terser plugin
 * @param {boolean} bTestBuild whether to run instanbul plugin (if true) for coverage or to strip testing exports (if false)
 * @param {boolean} bBundleD3 whether to bundle D3 plugins or to reference them as externals
 * @returns
 */
function buildOutput(file, format, terse, bTestBuild, bBundleD3 = true) {
	/** @type {import('rollup').RollupOptions} */
	const options = {
		input: "src/index.js",
		external: [
			"chart.js",
			"chart.js/helpers",
			...(bBundleD3 ? [] : ["d3-drag", "d3-selection"]),
		],
		output: {
			name: "index",
			file,
			format,
			exports: "named",
			globals: {
				"chart.js": "Chart",
				"chart.js/helpers": "Chart.helpers",
			},
			banner,
		},
		plugins: [
			...(bTestBuild
				? [
						// in a test build, inject istanbul and keep testing exports
						istanbul({
							exclude: ["node_modules/**/*"],
						}),
					]
				: [
						// in a non-test build, strip the testing exports
						replace({
							values: {
								"export const exportsForTesting = mExportsForTesting;": "",
							},
							delimiters: ["", ""], // no delimiters, we want to replace literally
							preventAssignment: true, // prevent replacing near assignment - setting recommended by plugin docs
						}),
					]),
			commonjs(),
			resolve({
				browser: true,
			}),
			terse ? terser() : undefined,
			copy({
				targets: [
					{ src: pkg.main, dest: "docs/assets" }, // not for testing, just for docs deployment; testing package will be redirected with playwright's fixtures for network mocks
					{
						src: "node_modules/chart.js/dist/chart.umd.js",
						dest: "docs/assets",
						rename: "chart.min.js",
					},
				],
			}),
			typescript({
				tsconfig: "./tsconfig.build.json",
			}),
		],
	};

	return options;
}

/** @type {import('rollup').RollupOptions[]} */
const config = [
	buildOutput(pkg.main, "umd", false, false),
	buildOutput(pkg.browser, "umd", true, false),
	buildOutput(pkg.module, "es", true, false),
	buildOutput(pkg.main.replace(".js", "-test-browser.js"), "umd", false, true), // bundle for E2E testing: istanbul + bundled D3 (for browser)
	buildOutput(pkg.main.replace(".js", "-test.js"), "umd", false, true, false), // bundle for unit/integration testing: istanbul + external D3
];

module.exports = config;
