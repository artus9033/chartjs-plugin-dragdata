module.exports = {
	exclude: [
		".rollup.cache",
		"__tests__",
		"node_modules",
		"*.config.ts",
		"*.config.js",
	],
	reporter: ["lcov", "json"],
};
