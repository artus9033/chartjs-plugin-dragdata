import path from "path";

import config from "config";

import { AxisSpec } from "./axisSpec";

let TESTED_AXES: AxisSpec[] = ["x", "y", "both"],
	TEST_HTML_FILES_WHITELIST: string[] | undefined = undefined,
	ENABLED_INTERACTIONS: Array<
		| "standardDragging"
		| "draggingOutOfCanvasBoundsX"
		| "draggingOutOfCanvasBoundsY"
	> = [
		"standardDragging",
		"draggingOutOfCanvasBoundsX",
		"draggingOutOfCanvasBoundsY",
	];

if (config.has("e2e.testedAxes")) {
	TESTED_AXES = Object.entries(
		config.get<Record<AxisSpec, boolean>>("e2e.testedAxes"),
	)
		.filter(([_, isEnabled]) => isEnabled)
		.map(([axisSpec, _]) => axisSpec as AxisSpec);
}

if (config.has("e2e.allowedTestHTMLFiles")) {
	TEST_HTML_FILES_WHITELIST = config.get("e2e.allowedTestHTMLFiles");
}

if (config.has("e2e.enabledInteractions")) {
	ENABLED_INTERACTIONS = config.get("e2e.enabledInteractions");
}

const testsConfig = {
	TESTED_AXES,
	TEST_HTML_FILES_WHITELIST,
	ENABLED_INTERACTIONS,
};

export function showConfig() {
	console.log(
		`Merged tests configuration from files ${config.util
			.getConfigSources()
			.map(({ name }) => path.basename(name))
			.join(", ")}:`,
	);

	console.table(
		Object.entries(testsConfig).map(([key, value]) => ({
			key,
			value:
				(typeof value) in ["number", "string", "boolean"] ||
				value === undefined ||
				value === null ||
				Array.isArray(value)
					? value
					: JSON.stringify(value),
		})),
	);
}

export default testsConfig;
