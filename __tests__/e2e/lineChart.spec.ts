import { test } from "./__fixtures__";
import { playwrightExpectDragSuccessful } from "./__fixtures__/interaction";

test("moves a dataset point to a different dataset point upon drag on Y axis", async ({
	page,
}) => {
	await playwrightExpectDragSuccessful(
		page,
		{ datasetIndex: 0, index: 0 },
		{ datasetIndex: 0, index: 1 },
		"line",
		"y",
	);
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
