const fs = require("fs");
const path = require("path");

const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve");
const terser = require("@rollup/plugin-terser");
const istanbul = require("rollup-plugin-istanbul");
const typescript = require("@rollup/plugin-typescript");

const pkg = require("./package.json");

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.repository.url}
 * (c) 2018-${new Date().getFullYear()} ${pkg.name} contributors
 * Released under the ${pkg.license} license
 */`;

/**
 * Create a rollup configuration for a given file
 * @param {string} options.file the input file
 * @param {import("rollup").ModuleFormat} options.format the format of the output module
 * @param {boolean} options.terse whether to run terser plugin
 * @param {boolean} options.bTestBuild whether to run istanbul plugin (if true) for coverage or to strip testing exports (if false)
 * @param {boolean} options.bBundleD3 whether to bundle D3 plugins or to reference them as externals
 * @returns {import('rollup').RollupOptions} the built options
 */
function bundleDragDataPlugin({
	file,
	format,
	terse,
	bTestBuild = false,
	bBundleD3 = true,
}) {
	/** @type {import('rollup').RollupOptions} */
	const customOptions = {
		input: "src/index.ts",
		external: [
			"chart.js",
			"chart.js/helpers",
			...(bBundleD3 ? [] : ["d3-drag", "d3-selection"]),
		],
		output: {
			exports: "named",
			banner,
			name: "ChartJSDragDataPlugin",
			file,
			format,
			globals: {
				"chart.js": "Chart",
				"chart.js/helpers": "Chart.helpers",
			},
		},
		plugins: [
			...(format === "umd" ? [commonjs()] : []),
			resolve({
				browser: true,
			}),
			...(bTestBuild
				? process.env.DISABLE_ISTANBUL_COVERAGE_AT_BUILD !== "true"
					? [
							// in a test build, inject istanbul and keep testing exports
							istanbul({
								exclude: ["node_modules/**/*"],
							}),
						]
					: []
				: []),
			terse ? terser() : undefined,
			typescript({
				tsconfig: "./tsconfig.build.json",
			}),
			{
				// copy index.d.ts to file matching the bundle filename for jest tests to pick up typings
				closeBundle() {
					if (bTestBuild) {
						const dir = path.dirname(file);
						fs.mkdirSync(dir, { recursive: true });

						fs.copyFileSync(
							path.join(dir, "index.d.ts"),
							file.replace(".js", ".d.ts"),
						);
					}
				},
			},
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
	}),

	bundleDragDataPlugin({
		file: pkg.browser,
		format: "umd",
		terse: true,
	}),

	bundleDragDataPlugin({
		file: pkg.module,
		format: "esm",
		terse: true,
	}),

	// bundle for E2E testing: istanbul + bundled D3 (for browser)
	bundleDragDataPlugin({
		file: pkg.main
			.replace(".js", "-test-browser.js")
			.replace("dist/", "dist/test/"),
		format: "umd",
		terse: false,
		bTestBuild: true,
	}),

	// bundle for unit/integration testing: istanbul + external D3
	bundleDragDataPlugin({
		file: pkg.main.replace(".js", "-test.js").replace("dist/", "dist/test/"),
		format: "es",
		terse: false,
		bTestBuild: true,
		bBundleD3: false,
	}),
];

module.exports = config;
