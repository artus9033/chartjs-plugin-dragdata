import { test } from "playwright-test-coverage";
import {
	ALL_AXES_SPECS,
	AxisSpec,
	getAxisDescription,
} from "../__utils__/structures/axisSpec";
import { describeDatasetPointSpecOrPoint } from "../__utils__/structures/scenario";
import { setupTests } from "./__fixtures__";
import { playwrightTestDrag } from "./__fixtures__/interaction";
import testsConfig from "../__utils__/testsConfig";
import { describeEachChartType } from "./__utils__/testHelpers";

for (const disablePlugin of [false, true]) {
	test.describe(`data dragging ${disablePlugin ? "disabled" : "enabled"}`, async () => {
		describeEachChartType(function testGenerator(fileName, scenario) {
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

							(stepsGroup.shouldBeSkipped ? test.describe.skip : test.describe)(
								groupNameSpaceCase,
								() => {
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
										});
									}
								},
							);
						}
					},
				);
			}
		});
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
