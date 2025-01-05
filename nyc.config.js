module.exports = {
	all: true,
	exclude: [
		".rollup.cache",
		"tests",
		"scripts",
		"node_modules",
		"*.config.ts",
		"*.config.js",
		"*.config.mjs",
	],
	include: ["src/**/*.ts"],
	reporter: ["lcov", "json"],
	excludeAfterRemap: false,
};
