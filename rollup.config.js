const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve");
const terser = require("@rollup/plugin-terser");
const istanbul = require("rollup-plugin-istanbul");
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
 * @param {string} options.file the input file
 * @param {import("rollup").ModuleFormat} options.format the format of the output module
 * @param {boolean} options.terse whether to run terser plugin
 * @param {boolean} options.bTestBuild whether to run instanbul plugin (if true) for coverage or to strip testing exports (if false)
 * @param {boolean} options.bBundleD3 whether to bundle D3 plugins or to reference them as externals
 * @return {import('rollup').RollupOptions} the built options
 */
function bundleDragDataPlugin(options) {
	const { file, format, terse, bTestBuild, bBundleD3 = true } = options;

	/** @type {import('rollup').RollupOptions} */
	const customOptions = {
		input: "src/index.js",
		external: [
			"chart.js",
			"chart.js/helpers",
			...(bBundleD3 ? [] : ["d3-drag", "d3-selection"]),
		],
		output: {
			exports: "named",
			banner,
			name: "index",
			file,
			format,
			globals: {
				"chart.js": "Chart",
				"chart.js/helpers": "Chart.helpers",
			},
		},
		plugins: [
			commonjs(),
			resolve({
				browser: true,
			}),
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
			terse ? terser() : undefined,
			typescript({
				tsconfig: "./tsconfig.build.json",
			}),
		],
	};

	return customOptions;
}

/** @type {import('rollup').RollupOptions[]} */
const config = [
	bundleDragDataPlugin({
		file: pkg.main,
		format: "umd",
		terse: false,
		bTestBuild: false,
	}),

	bundleDragDataPlugin({
		file: pkg.browser,
		format: "umd",
		terse: true,
		bTestBuild: false,
	}),

	bundleDragDataPlugin({
		file: pkg.module,
		format: "es",
		terse: true,
		bTestBuild: false,
	}),

	// bundle for E2E testing: istanbul + bundled D3 (for browser)
	bundleDragDataPlugin({
		file: pkg.main.replace(".js", "-test-browser.js"),
		format: "es",
		terse: false,
		bTestBuild: true,
	}),

	// bundle for unit/integration testing: istanbul + external D3
	bundleDragDataPlugin({
		file: pkg.main.replace(".js", "-test.js"),
		format: "es",
		terse: false,
		bTestBuild: true,
		bBundleD3: false,
	}),
];

module.exports = config;
