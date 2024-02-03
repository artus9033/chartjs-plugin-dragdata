import { test } from "playwright-test-coverage";
import fs from "fs";
import path from "path";
import { TestScenarios } from "../__data__/data";
import { AxisSpec, getAxisDescription } from "../__utils__/axisSpec";
import { describeDatasetPointSpecOrPoint } from "../__utils__/scenario";
import { setupTests } from "./__fixtures__";
import { playwrightTestDrag } from "./__fixtures__/interaction";
import testsConfig from "../__utils__/testsConfig";

const demosDistDirPath = path.join(
	path.dirname(__filename),
	"..",
	"..",
	"demos",
	"dist",
);

for (const disablePlugin of [false, true]) {
	test.describe(`data dragging ${disablePlugin ? "disabled" : "enabled"}`, async () => {
		for (const fileName of fs.readdirSync(demosDistDirPath).filter(
			(file) =>
				path.extname(file) === ".html" &&
				(testsConfig.TEST_HTML_FILES_WHITELIST
					? testsConfig.TEST_HTML_FILES_WHITELIST.includes(file)
					: true), // by default, if no whitelist is provided, all files are tested
		) as (keyof typeof TestScenarios)[]) {
			test.describe(`${fileName.split(".")[0]} chart`, () => {
				const scenario = TestScenarios[fileName];

				for (let draggableAxis of ["x", "y", "both"] satisfies AxisSpec[]) {
					test.describe(`test dragging on ${getAxisDescription(draggableAxis)}`, () => {
						setupTests({ fileName, disablePlugin, draggableAxis });

						for (const step of scenario.steps) {
							const pluginDisabledForTestedAxis =
								disablePlugin ||
								(step.axisSpec !== "both" && step.axisSpec !== draggableAxis);

							test(`${pluginDisabledForTestedAxis ? "does not move" : "moves"} ${describeDatasetPointSpecOrPoint(step.dragPointSpec)} towards ${describeDatasetPointSpecOrPoint(step.dragDestPointSpecOrStartPointOffset)} upon dragging on ${getAxisDescription(step.axisSpec)}`, async ({
								page,
							}) => {
								await playwrightTestDrag({
									...step,
									whichAxis: step.axisSpec,
									page,
									draggableAxis,
									isDragDataPluginDisabled: disablePlugin,
									isCategoricalX: scenario.isCategoricalX,
									isCategoricalY: scenario.isCategoricalY,
								});

								// await expect(page).toHaveScreenshot();
							});
						}
					});
				}
			});
		}
	});
}

// // bar chart
// await runTests("bar", indexTestSettings);

// // dual axis
// const dualAxisSettings = new TestSettings();
// dragPointSpec.datasetIndex = 1; // use second dataset instead
// dragPointSpec.index = 3;
// await runTests("dualAxis", dualAxisSettings);
// // small chart
// dragPointSpec.index = 1;
// await runTests("smallChart", dualAxisSettings);
