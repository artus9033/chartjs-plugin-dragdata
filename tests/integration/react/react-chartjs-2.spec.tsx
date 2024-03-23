import ChartJS from "chart.js/auto";
import React from "react";
import { Chart } from "react-chartjs-2";

import { cleanup, render } from "@testing-library/react";

import ChartJSdragDataPlugin from "../../../dist/chartjs-plugin-dragdata-test-browser";
import {
	TestChartOptions,
	genericChartScenarioBase,
} from "../../__data__/data";
import { integrationAllowed } from "../__utils__/utils";

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
				...TestChartOptions,
			}}
			plugins={[ChartJSdragDataPlugin]}
		/>
	);
}

(integrationAllowed("react") ? describe : describe.skip)("react.js", () => {
	test("renders chart canvas in the document", () => {
		render(<ChartComponent />);

		expect(chartInstance!.canvas).toBeInTheDocument();
	});
});
