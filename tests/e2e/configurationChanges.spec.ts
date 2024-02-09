import { test } from "playwright-test-coverage";

import { setupTests } from "./__fixtures__";
import {
	PlaywrightTestDragParams,
	playwrightTestDrag,
} from "./__fixtures__/interaction";
import { describeEachChartType } from "./__utils__/testHelpers";

type PluginEnablerLocationSpec =
	| "x-scale"
	| "y-scale"
	| "dataset config"
	| "data sample config";

const ALL_ENABLER_LOCATION_SPECS: PluginEnablerLocationSpec[] = [
	// "x-scale",
	// "y-scale",
	// "dataset config",
	"data sample config",
];

describeEachChartType(function testGenerator(fileName, scenario) {
	for (let enablerLocationSpec of ALL_ENABLER_LOCATION_SPECS) {
		setupTests({ fileName, draggableAxis: "both" });

		// to configure drag data to be disabled for a given data sample, we need to pass an object specifying that sample
		// on the other hand, when one of the axes is categorical, then the sample is scalar (number), thus such a test case is impossible to be carried out
		if (
			!(
				enablerLocationSpec === "data sample config" &&
				(scenario.isCategoricalX || scenario.isCategoricalY)
			)
		) {
			test(`data dragging behaviour changes appropriately upon ${enablerLocationSpec} dragData configuration property changes`, async ({
				page,
			}) => {
				const step = scenario.stepGroups[0].steps[0],
					commonDragParams: Omit<
						PlaywrightTestDragParams,
						"isDragDataPluginDisabled"
					> = {
						...step,
						whichAxis: step.axisSpec,
						page,
						draggableAxis: "both",
						isCategoricalX: scenario.isCategoricalX,
						isCategoricalY: scenario.isCategoricalY,
					};

				async function updateChartDragDataEnabledConfig(bEnabled: boolean) {
					await page.evaluate(
						({ enablerLocationSpec, bEnabled, step }) => {
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
											window.testedChart.data.datasets[
												step.dragPointSpec.datasetIndex
											].data[step.dragPointSpec.datasetIndex];

										if (typeof dataSample === "number") {
											throw new Error(
												"updateChartDragDataEnabledConfig: data sample config dragData enabler location specifier is incompatible with charts using a categorical axis",
											);
										}

										window.testedChart.data.datasets[
											step.dragPointSpec.datasetIndex
										].data[step.dragPointSpec.datasetIndex] = Array.isArray(
											dataSample,
										)
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

							window.testedChart.update();
						},
						{
							enablerLocationSpec,
							bEnabled,
							step,
						},
					);
				}

				// disable dragData for a given axis
				await updateChartDragDataEnabledConfig(false);

				// assert that no drag occurs when the plugin is disabled
				await playwrightTestDrag({
					...commonDragParams,
					isDragDataPluginDisabled: true,
				});

				// update the configuration to enable dragData again for the axis
				await updateChartDragDataEnabledConfig(true);

				// assert that the drag occurs after configuration allows for dragging again
				await playwrightTestDrag(commonDragParams);
			});
		}
	}
});
