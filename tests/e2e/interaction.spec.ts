import type { Page } from "playwright";
import { expect, test } from "playwright-test-coverage";

import { ALL_TESTED_MAGNET_VARIANTS, MagnetVariant } from "../__utils__/magnet";
import {
	ALL_AXES_SPECS,
	AxisSpec,
	getAxisDescription,
} from "../__utils__/structures/axisSpec";
import { describeDatasetPointSpecOrPoint } from "../__utils__/structures/scenario";
import testsConfig, {
	isTestsConfigWhitelistItemAllowed,
} from "../__utils__/testsConfig";
import { setupE2ETest } from "./__fixtures__";
import { playwrightTestDrag } from "./__fixtures__/interaction";
import {
	SCREENSHOT_TESTING_MAX_PIXEL_DIFF_PERCENT_DESKTOP,
	SCREENSHOT_TESTING_MAX_PIXEL_DIFF_PERCENT_MOBILE,
} from "./__utils__/constants";
import { describeEachChartType, hasGUI } from "./__utils__/testHelpers";

test.describe.configure({ mode: "parallel" });

let page: Page;

for (const disablePlugin of [false, true]) {
	test.describe(`data dragging ${disablePlugin ? "disabled" : "enabled"}`, () => {
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

						// only test magnet enabled in different variants on both-axes-draggable scenarios to reduce the number of test cases
						for (const magnet of disablePlugin || draggableAxis !== "both"
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

									test.beforeAll(
										"Setup page for series of tests",
										async ({ browser, isMobile }) => {
											page = await browser.newPage();

											await setupE2ETest(
												{
													fileName,
													disablePlugin,
													draggableAxis,
													magnet,
												},
												page,
												isMobile,
											);
										},
									);

									test.afterAll(
										"Clean page up after series of tests",
										async () => {
											await page.close();
										},
									);

									for (const stepsGroup of disablePlugin
										? scenario.stepGroups.slice(0, 1)
										: scenario.stepGroups) {
										const groupNameSpaceCase = stepsGroup.groupName.replace(
											/[A-Z]/g,
											(letter) => ` ${letter.toLowerCase()}`,
										);

										if (
											!(
												stepsGroup.groupName === "standardDragging" &&
												draggableAxis === "both"
											)
										) {
											const forceDraggableAxisIncompatibility =
												scenario.forceDraggableAxis === undefined
													? false
													: scenario.forceDraggableAxis !== draggableAxis &&
														scenario.forceDraggableAxis !== "both";

											(stepsGroup.shouldBeSkipped ||
												forceDraggableAxisIncompatibility
												? test.describe.skip
												: test.describe)(groupNameSpaceCase, () => {
												for (const {
													step,
													isLastStepInGroup,
													exactDraggingImpossible,
													partialDraggingPossible,
												} of (disablePlugin
													? stepsGroup.steps.slice(0, 1)
													: stepsGroup.steps
												).map((step, index, { length }) => ({
													step,
													isLastStepInGroup: index === length - 1,
													exactDraggingImpossible:
														disablePlugin ||
														(draggableAxis !== "both" &&
															step.axisSpec !== draggableAxis),
													partialDraggingPossible: step.axisSpec === "both",
												}))) {
													test(`${
														exactDraggingImpossible
															? partialDraggingPossible
																? "partially moves"
																: "does not move"
															: "moves"
													} ${describeDatasetPointSpecOrPoint(step.dragPointSpec)} towards ${describeDatasetPointSpecOrPoint(step.dragDestPointSpecOrStartPointOffset)} with dragging constrained to ${getAxisDescription(step.axisSpec)}`, async ({
														browserName,
														isMobile,
													}, testInfo) => {
														testInfo.snapshotSuffix = ""; // disable per-platform screenshot snapshots

														test.skip(
															!!scenario.unsupportedBrowsers?.includes(
																browserName,
															) ||
																(isMobile &&
																	(scenario.unsupportedBrowsers?.includes(
																		"mobile",
																	) ??
																		false)),
															"Browser not supported by this test scenario",
														);

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

														if (
															stepsGroup.shouldAssertScreenshot &&
															isLastStepInGroup
														) {
															// after each group: (conditionally) compare screenshot snapshots
															// note: so as not to produce an enormous amount of screenshots, we only compare
															// screenshot snapshots if both axes are not prohibited from being draggable
															// by config (although they can still be categorical, thus not draggable)
															if (draggableAxis === "both" && !hasGUI()) {
																await expect(
																	page,
																	"Snapshot screenshots should be similar",
																).toHaveScreenshot({
																	maxDiffPixelRatio: testInfo.project.name
																		.toLowerCase()
																		.includes("mobile")
																		? SCREENSHOT_TESTING_MAX_PIXEL_DIFF_PERCENT_MOBILE
																		: SCREENSHOT_TESTING_MAX_PIXEL_DIFF_PERCENT_DESKTOP,
																});
															}

															// after each group & (optionally) screenshot comparison, force reload the original dataset so as not to influence the next group
															await test.step("Reset data for next interaction", async () => {
																await page.evaluate(() => {
																	window.resetData();
																});
															});
														}
													});
												}
											});
										}
									}
								},
							);
						}
					},
				);
			}
		}, "interaction");
	});
}
