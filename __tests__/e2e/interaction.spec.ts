import { expect } from "@playwright/test";

import { TestScenarios } from "../__data__/data";
import { getAxisDescription } from "../__utils__/axisSpec";
import { describeDatasetPointSpecOrPoint } from "../__utils__/scenario";
import { setupTests, test } from "./__fixtures__";
import { playwrightTestDrag } from "./__fixtures__/interaction";

test.describe("line chart", () => {
	for (const disablePlugin of [false, true]) {
		test.describe(`data dragging ${disablePlugin ? "disabled" : "enabled"}`, async () => {
			setupTests({ fileName: "line", disablePlugin });

			for (const step of TestScenarios.line) {
				const pluginDisabledForAxis = disablePlugin;

				test(`${pluginDisabledForAxis ? "does not move" : "moves"} ${describeDatasetPointSpecOrPoint(step.dragPointSpec)} to ${describeDatasetPointSpecOrPoint(step.destRefPointOrSpec)} upon dragging on ${getAxisDescription(step.axisSpec)}`, async ({
					page,
				}) => {
					// await expect(page).toHaveScreenshot();

					await playwrightTestDrag({
						page,
						dragPointSpec: step.dragPointSpec,
						destRefPointOrSpec: step.destRefPointOrSpec,
						whichAxis: step.axisSpec,
						disablePlugin,
					});

					// await expect(page).toHaveScreenshot();
				});
			}
		});
	}
});

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
