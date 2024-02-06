import { test } from "playwright-test-coverage";
import fs from "fs";
import path from "path";
import { TestScenarios } from "../__data__/data";
import {
	ALL_AXES_SPECS,
	AxisSpec,
	getAxisDescription,
} from "../__utils__/structures/axisSpec";
import { describeDatasetPointSpecOrPoint } from "../__utils__/structures/scenario";
import { setupTests } from "./__fixtures__";
import { playwrightTestDrag } from "./__fixtures__/interaction";
import testsConfig, { isWhitelistItemAllowed } from "../__utils__/testsConfig";

const demosDistDirPath = path.join(
	path.dirname(__filename),
	"..",
	"..",
	"demos",
	"dist",
);

for (const disablePlugin of [false, true]) {
	test.describe(`data dragging ${disablePlugin ? "disabled" : "enabled"}`, async () => {
		for (const fileName of fs
			.readdirSync(demosDistDirPath)
			.filter(
				(file) =>
					!fs.lstatSync(path.join(demosDistDirPath, file)).isDirectory(),
			) as (keyof typeof TestScenarios)[]) {
			(path.extname(fileName) === ".html" &&
				isWhitelistItemAllowed("e2e", "whitelistedHTMLFiles", fileName)
				? test.describe
				: test.describe.skip)(`${fileName.split(".")[0]} chart`, () => {
				const scenario = TestScenarios[fileName];

				for (let draggableAxis of ALL_AXES_SPECS satisfies AxisSpec[]) {
					(testsConfig.e2e.testedAxes.includes(draggableAxis)
						? test.describe
						: test.describe.skip)(
						`draggable ${getAxisDescription(draggableAxis)}`,
						() => {
							setupTests({ fileName, disablePlugin, draggableAxis });

							for (const stepsGroup of scenario.stepGroups) {
								const groupNameSpaceCase = stepsGroup.groupName.replace(
									/[A-Z]/g,
									(letter) => ` ${letter.toLowerCase()}`,
								);

								(stepsGroup.shouldBeSkipped
									? test.describe.skip
									: test.describe)(groupNameSpaceCase, () => {
									for (const step of stepsGroup.steps) {
										const pluginDisabledForTestedAxis =
											disablePlugin ||
											(step.axisSpec !== "both" &&
												step.axisSpec !== draggableAxis);

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
						},
					);
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
