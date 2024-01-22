import { ModuleFormat, RollupOptions } from "rollup";

import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import istanbul from "rollup-plugin-istanbul";
import copy from "rollup-plugin-copy";

// Import the package.json file to get the version number by using the createRequire function
import pkg from "./package.json" assert { type: "json" };

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.repository.url}
 * (c) 2018-${new Date().getFullYear()} ${pkg.name} contributors
 * Released under the ${pkg.license} license
 */`;

function buildOutput(
	file: string,
	format: ModuleFormat,
	terse: boolean,
): RollupOptions {
	return {
		input: "src/index.js",
		external: ["chart.js", "chart.js/helpers"],
		output: {
			name: "index",
			file,
			format,
			exports: "auto",
			globals: {
				"chart.js": "Chart",
				"chart.js/helpers": "Chart.helpers",
			},
			banner,
		},
		plugins: [
			commonjs(),
			resolve({
				browser: true,
			}),
			istanbul({
				// exclude: [".rollup.cache", "__tests__", "node_modules"],
			}),
			terse ? terser() : undefined,
			copy({
				targets: [
					{ src: pkg.main, dest: "docs/assets" },
					{
						src: "node_modules/chart.js/dist/chart.min.js",
						dest: "docs/assets",
					},
				],
			}),
		],
	};
}

const config: RollupOptions[] = [
	buildOutput(pkg.main, "umd", false),
	buildOutput(pkg.browser, "umd", true),
	buildOutput(pkg.module, "es", true),
];

export default config;
