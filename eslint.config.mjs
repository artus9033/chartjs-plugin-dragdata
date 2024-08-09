import configCK from "@callstack/eslint-config/react-native.flat.js";
import tsEslintParser from "@typescript-eslint/parser";

export default [
	{
		ignores: [
			"**/dist",
			"**/coverage",
			"**/.nyc_output",
			"**/.github",
			"**/docs",
			"demos/dist",
			"eslint.config.mjs",
		],
	},
	...configCK,
	{
		rules: {
			"prettier/prettier": ["error"],
			"import/no-extraneous-dependencies": ["off"],
		},
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tsEslintParser,
			parserOptions: { project: "./tsconfig.eslint.json" },
		},
	},
];
