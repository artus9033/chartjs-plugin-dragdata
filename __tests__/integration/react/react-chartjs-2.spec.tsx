import { Chart as ChartJS, registerables } from "chart.js";
import React from "react";
import { Chart } from "react-chartjs-2";

import { cleanup, render } from "@testing-library/react";

import ChartJSdragDataPlugin from "../../../dist/chartjs-plugin-dragdata-test-browser";
import { expectDragSuccessful } from "../../__fixtures__/interaction";
import { data, options } from "../__data__/data";

ChartJS.register(...registerables);

let chartInstance: ChartJS | null = null;

beforeEach(() => {
	chartInstance = null;
});

afterEach(() => {
	if (chartInstance) chartInstance.destroy();

	cleanup();
});

function ChartComponent() {
	return (
		<Chart
			ref={(ref) => {
				chartInstance = ref!;
			}}
			type="line"
			data={data}
			options={options}
			plugins={[ChartJSdragDataPlugin]}
		/>
	);
}

test("renders chart canvas in the document", () => {
	render(<ChartComponent />);

	expect(chartInstance!.canvas).toBeInTheDocument();
});

test("updates chart data on drag event", async () => {
	render(<ChartComponent />);

	await expectDragSuccessful(
		chartInstance!,
		{ datasetIndex: 0, index: 0 },
		{ datasetIndex: 0, index: 1 },
		"y",
	);
});
