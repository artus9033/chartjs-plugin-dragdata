import fs from "fs";
import path from "path";

import ejs from "ejs";

import {
	TestScenarios,
	type TestScenarios as TestScenariosType,
} from "../../tests/__data__/data";
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
		scenario = TestScenarios[fileName];

	return {
		html: template({
			title: `${title} demo`,
			scenarioConfiguration: JSON.stringify(scenario.configuration),
		}),
		outputFileName: fileName as string,
	};
}
