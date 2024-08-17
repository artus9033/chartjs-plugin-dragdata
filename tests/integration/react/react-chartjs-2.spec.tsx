import ChartJS from "chart.js/auto";
import React from "react";
import { Chart } from "react-chartjs-2";

import { cleanup, render } from "@testing-library/react";

import ChartJSDragDataPlugin from "../../../dist/test/chartjs-plugin-dragdata-test";
import {
	JestTestChartOptions,
	genericChartScenarioBase,
} from "../../__data__/data";
import { integrationAllowed } from "../__utils__";

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
			data={genericChartScenarioBase.configuration.data}
			options={{
				...JestTestChartOptions,
			}}
			plugins={[ChartJSDragDataPlugin]}
		/>
	);
}

(integrationAllowed("react") ? describe : describe.skip)("react.js", () => {
	it("renders chart canvas in the document", () => {
		render(<ChartComponent />);

		expect(chartInstance!.canvas).toBeInTheDocument();
	});
});
