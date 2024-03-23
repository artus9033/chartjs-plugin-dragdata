module.exports = {
	presets: [
		"@babel/preset-env",
		"@babel/preset-typescript",
		"@babel/preset-react",
	],
	env: {
		test: {
			plugins: ["@babel/plugin-transform-modules-commonjs"],
			presets: [["@babel/preset-env", { targets: { node: "current" } }]],
		},
	},
};
