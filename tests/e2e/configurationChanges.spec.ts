import { test } from "playwright-test-coverage";

import Offset2D from "../__utils__/structures/Offset2D";
import { DatasetPointSpec } from "../__utils__/testTypes";
import IncompatibleTestConfiguration from "../errors/IncompatibleTestConfiguration";
import { setupE2ETest } from "./__fixtures__";
import {
	PlaywrightTestDragParams,
	playwrightTestDrag,
} from "./__fixtures__/interaction";
import { BAR_SAFETY_HIT_MARGIN } from "./__utils__/constants";
import { describeEachChartType } from "./__utils__/testHelpers";

type PluginEnablerLocationSpec =
	| "x-scale"
	| "y-scale"
	| "dataset config"
	| "data sample config";

const ALL_ENABLER_LOCATION_SPECS: PluginEnablerLocationSpec[] = [
	"x-scale",
	"y-scale",
	"dataset config",
	"data sample config",
];

test.describe.configure({ mode: "parallel" });

describeEachChartType(function testGenerator(fileName, scenario) {
	test.describe.configure({ mode: "parallel" });

	for (let enablerLocationSpec of ALL_ENABLER_LOCATION_SPECS.filter(
		(enablerLocationSpec) =>
			// to configure drag data to be disabled just for a given data sample, we need to pass an object specifying that sample
			// on the other hand, when one of the axes is categorical, then the sample is scalar (number), thus such a test case is impossible to be carried out
			!(
				enablerLocationSpec === "data sample config" &&
				(scenario.isCategoricalX || scenario.isCategoricalY)
			),
	)) {
		test.beforeEach(async ({ page, isMobile }) => {
			await setupE2ETest({ fileName, draggableAxis: "both" }, page, isMobile);
		});

		test(`data dragging behaviour changes appropriately upon ${enablerLocationSpec} dragData configuration property changes`, async ({
			page,
			browserName,
			isMobile,
		}) => {
			test.skip(
				!!scenario.unsupportedBrowsers?.includes(browserName) ||
					(isMobile &&
						(scenario.unsupportedBrowsers?.includes("mobile") ?? false)),
				"Browser not supported by this test scenario",
			);

			test.skip(
				scenario.forceDraggableAxis === undefined
					? false
					: scenario.forceDraggableAxis !== "both",
				"forceDraggableAxis forces a value other than 'both'",
			);

			const dragPointSpec: DatasetPointSpec = {
					datasetIndex: 0,
					index: 0,
					additionalOffset:
						// since the bar chart does not support hit radius extension, we need to be precise
						// and as testing is not perfectly precise, we want a safety margin: we start
						// dragging from a bit lower than the edge to make sure we hit the bar
						new Offset2D({
							yAbs: -BAR_SAFETY_HIT_MARGIN,
							scalable: false,
							shouldBeLogged: false,
						}),
				},
				dragDestPointSpecOrStartPointOffset: DatasetPointSpec = {
					datasetIndex: 1,
					index: 3,
				},
				commonDragParams: Omit<
					PlaywrightTestDragParams,
					"isDragDataPluginDisabled"
				> = {
					dragPointSpec,
					dragDestPointSpecOrStartPointOffset,
					whichAxis: "both",
					page,
					draggableAxis: "both",
					isCategoricalX: scenario.isCategoricalX,
					isCategoricalY: scenario.isCategoricalY,
				};

			async function updateChartDragDataEnabledConfig(bEnabled: boolean) {
				await page.evaluate(
					({ enablerLocationSpec, bEnabled, dragPointSpec }) => {
						switch (enablerLocationSpec) {
							case "dataset config":
								window.testedChart.data.datasets =
									window.testedChart.data.datasets.map((dataset) => ({
										...dataset,
										dragData: bEnabled,
									}));
								break;

							case "data sample config":
								{
									const dataSample =
										window.testedChart.data.datasets[dragPointSpec.datasetIndex]
											.data[dragPointSpec.datasetIndex];

									if (typeof dataSample === "number") {
										throw new IncompatibleTestConfiguration(
											"updateChartDragDataEnabledConfig: 'data sample config' dragData enabler location specifier is incompatible with charts using a categorical axis",
										);
									}

									window.testedChart.data.datasets[
										dragPointSpec.datasetIndex
									].data[dragPointSpec.datasetIndex] = Array.isArray(dataSample)
										? {
												x: dataSample[0],
												y: dataSample[1],
												// TODO: fix this later with proper TS typings
												// @ts-ignore
												dragData: bEnabled,
											}
										: {
												...dataSample,
												// TODO: fix this later with proper TS typings
												// @ts-ignore
												dragData: bEnabled,
											};
								}
								break;

							case "x-scale":
							case "y-scale":
								window.testedChart.config.options!.scales![
									enablerLocationSpec === "x-scale" ? "x" : "y"
									// TODO: fix this later with proper TS typings
									// @ts-ignore
								]!.dragData = bEnabled;
								break;
						}

						window.testedChart.update("none");

						console.log(
							"[updateChartDragDataEnabledConfig] Updated configuration:",
							JSON.stringify(window.testedChart.config),
						);
					},
					{
						enablerLocationSpec,
						bEnabled,
						dragPointSpec,
					},
				);
			}

			// disable dragData for a given axis
			await updateChartDragDataEnabledConfig(false);

			// assert that no drag occurs when the plugin is disabled
			await playwrightTestDrag({
				...commonDragParams,
				isDragDataPluginDisabled: true,
				additionalInfo: " (dragging disabled)",
			});

			// update the configuration to enable dragData again for the axis
			await updateChartDragDataEnabledConfig(true);

			// assert that the drag occurs after configuration allows for dragging again
			await playwrightTestDrag({
				...commonDragParams,
				additionalInfo: " (dragging enabled)",
			});
		});
	}
});
