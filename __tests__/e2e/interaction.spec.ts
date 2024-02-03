import { expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { TestScenarios } from "../__data__/data";
import { AxisSpec, getAxisDescription } from "../__utils__/axisSpec";
import { describeDatasetPointSpecOrPoint } from "../__utils__/scenario";
import { setupTests, test } from "./__fixtures__";
import { playwrightTestDrag } from "./__fixtures__/interaction";
import { ChartTypeRegistry } from "chart.js";
import {
	playwrightCalcCanvasOffset,
	playwrightGetChartDatasetMeta,
} from "./__utils__/chartUtils";
import { getDatasetPointLocation } from "../__utils__/chartUtils";
import { DatasetPointSpec } from "../__utils__/testTypes";

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
				(file) => path.extname(file) === ".html",
			) as (keyof typeof TestScenarios)[]) {
			test.describe(`${fileName.split(".")[0]} chart`, () => {
				const scenario = TestScenarios[fileName];

				for (const draggableAxis of ["x", "y", "both"] satisfies AxisSpec[]) {
					test.describe(`draggable ${getAxisDescription(draggableAxis)}`, () => {
						setupTests({ fileName, disablePlugin, draggableAxis });

						for (const step of scenario.steps) {
							const pluginDisabledForTestedAxis =
								disablePlugin ||
								(step.axisSpec !== "both" && step.axisSpec !== draggableAxis);

							test(`${pluginDisabledForTestedAxis ? "does not move" : "moves"} ${describeDatasetPointSpecOrPoint(step.dragPointSpec)} to ${describeDatasetPointSpecOrPoint(step.destRefPointOrSpec)} upon dragging on ${getAxisDescription(step.axisSpec)}`, async ({
								page,
							}) => {
								// await expect(page).toHaveScreenshot();
								const canvasBB = await playwrightCalcCanvasOffset(page);
								console.log(
									(await playwrightGetChartDatasetMeta(page, 0)).data.map(
										(d) => ({ x: d.x, y: d.y }),
									),
									step.dragPointSpec,
									await getDatasetPointLocation(
										async (i) => await playwrightGetChartDatasetMeta(page, i),
										step.dragPointSpec,
										canvasBB,
									),
									step.destRefPointOrSpec,
									await getDatasetPointLocation(
										async (i) => await playwrightGetChartDatasetMeta(page, i),
										step.destRefPointOrSpec as DatasetPointSpec,
										canvasBB,
									),
								);
								await playwrightTestDrag({
									page,
									dragPointSpec: step.dragPointSpec,
									destRefPointOrSpec: step.destRefPointOrSpec,
									whichAxis: step.axisSpec,
									isDragDataPluginDisabled: pluginDisabledForTestedAxis,
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
