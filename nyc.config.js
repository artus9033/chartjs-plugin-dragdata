module.exports = {
	exclude: [
		".rollup.cache",
		"tests",
		"scripts",
		"node_modules",
		"*.config.ts",
		"*.config.js",
	],
	reporter: ["lcov", "json"],
};
