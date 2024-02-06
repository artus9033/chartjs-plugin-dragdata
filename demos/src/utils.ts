import fs from "fs";
import path from "path";

import ejs from "ejs";

import type { TestScenarios as TestScenariosType } from "../../tests/__data__/data";
import { BundledPage } from "./types";

export function requireUncached(module: string) {
	delete require.cache[require.resolve(module)];
	return require(module);
}

export function ejsFileToTemplate(ejsFilePath: string) {
	return ejs.compile(fs.readFileSync(ejsFilePath, "utf8").toString());
}

export function renderPage({
	title,
	fileName,
}: {
	title: string;
	fileName: keyof typeof TestScenariosType;
}): BundledPage {
	const template = ejsFileToTemplate(
			path.join(path.dirname(__filename), "templates", "layout.html.ejs"),
		),
		// force re-import of data to avoid caching & load always the newest data in watch mode
		{ TestScenarios } = requireUncached("../../tests/__data__/data") as {
			TestScenarios: typeof TestScenariosType;
		},
		scenario = TestScenarios[fileName];

	return {
		html: template({
			title: `${title} demo`,
			configurationOverrides: JSON.stringify(scenario.configuration),
			roundingPrecision: JSON.stringify(scenario.roundingPrecision),
		}),
		outputFileName: fileName as string,
	};
}
