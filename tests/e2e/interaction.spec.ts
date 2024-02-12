import { test, expect } from "playwright-test-coverage";
import path from "path";
import {
	ALL_AXES_SPECS,
	AxisSpec,
	getAxisDescription,
} from "../__utils__/structures/axisSpec";
import { describeDatasetPointSpecOrPoint } from "../__utils__/structures/scenario";
import { playwrightTestDrag } from "./__fixtures__/interaction";
import testsConfig, {
	isTestsConfigWhitelistItemAllowed,
} from "../__utils__/testsConfig";
import { describeEachChartType, hasGUI } from "./__utils__/testHelpers";
import {
	ALL_TESTED_MAGNET_VARIANTS,
	MagnetImplementations,
	MagnetVariant,
} from "../__utils__/magnet";
import { SCREENSHOT_TESTING_MAX_PIXEL_DIFF_PERCENT } from "./__utils__/constants";
import type { Page } from "playwright";
import { setupE2ETest } from "./__fixtures__";
import Offset2D from "../__utils__/structures/Offset2D";

test.describe.configure({ mode: "parallel" });

let page: Page;

for (const disablePlugin of [false, true]) {
	test.describe(`data dragging ${disablePlugin ? "disabled" : "enabled"}`, async () => {
		test.describe.configure({ mode: "parallel" });

		describeEachChartType(function testGenerator(fileName, scenario) {
			for (let draggableAxis of disablePlugin
				? (["both"] satisfies AxisSpec[])
				: ALL_AXES_SPECS) {
				(testsConfig.e2e.testedAxes.includes(draggableAxis)
					? test.describe
					: test.describe.skip)(
					`draggable ${getAxisDescription(draggableAxis)}`,
					() => {
						test.describe.configure({ mode: "parallel" });

						for (const magnet of disablePlugin
							? (["none"] satisfies MagnetVariant[])
							: ALL_TESTED_MAGNET_VARIANTS) {
							(isTestsConfigWhitelistItemAllowed(
								"e2e",
								"whitelistedMagnetVariants",
								magnet,
							)
								? test.describe
								: test.describe.skip)(
								magnet === "none" ? "without magnet" : `with magnet ${magnet}`,
								() => {
									test.describe.configure({ mode: "serial" }); // in this context, we want tests to run serially since they will reuse that same page

									test.beforeAll(async ({ browser }, testInfo) => {
										page = await browser.newPage();

										await setupE2ETest(
											{
												fileName,
												disablePlugin,
												draggableAxis,
												magnet,
											},
											page,
											testInfo,
										);
									});

									test.afterAll(async () => {
										await page.close();
									});

									for (const stepsGroup of disablePlugin
										? scenario.stepGroups.slice(0, 1)
										: scenario.stepGroups) {
										const groupNameSpaceCase = stepsGroup.groupName.replace(
											/[A-Z]/g,
											(letter) => ` ${letter.toLowerCase()}`,
										);

										(stepsGroup.shouldBeSkipped
											? test.describe.skip
											: test.describe)(groupNameSpaceCase, async () => {
											for (const {
												step,
												isLastStepInGroup,
												draggingDisabledForInteraction,
											} of (disablePlugin
												? stepsGroup.steps.slice(0, 1)
												: stepsGroup.steps
											).map((step, index, { length }) => ({
												step,
												isLastStepInGroup: index === length - 1,
												draggingDisabledForInteraction:
													disablePlugin ||
													(step.axisSpec !== "both" &&
														step.axisSpec !== draggableAxis),
											}))) {
												test(`${
													draggingDisabledForInteraction
														? "does not move"
														: "moves"
												} ${describeDatasetPointSpecOrPoint(step.dragPointSpec)} towards ${describeDatasetPointSpecOrPoint(step.dragDestPointSpecOrStartPointOffset)} upon dragging on ${getAxisDescription(step.axisSpec)}`, async ({}, testInfo) => {
													testInfo.snapshotSuffix = ""; // disable per-platform screenshot snapshots

													// perform the interaction
													await playwrightTestDrag({
														...step,
														whichAxis: step.axisSpec,
														page,
														draggableAxis,
														isDragDataPluginDisabled: disablePlugin,
														isCategoricalX: scenario.isCategoricalX,
														isCategoricalY: scenario.isCategoricalY,
														magnet,
													});

													if (isLastStepInGroup) {
														// after each group: (conditionally) compare screenshot snapshots
														// note: so as not to produce an enormous amount of screenshots, we only compare
														// screenshot snapshots if both axes are not prohibited from being draggable
														// by config (although they can still be categorical, thus not draggable)
														if (draggableAxis === "both" && !hasGUI()) {
															await expect(page).toHaveScreenshot({
																maxDiffPixelRatio:
																	SCREENSHOT_TESTING_MAX_PIXEL_DIFF_PERCENT,
															});
														}

														// after each group & (optionally) screenshot comparison, force reload the original dataset so as not to influence the next group
														await page.evaluate(() => {
															window.resetData();
														});
													}
												});
											}
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
