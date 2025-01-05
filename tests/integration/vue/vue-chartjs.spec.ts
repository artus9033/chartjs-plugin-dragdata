import "chart.js/auto";

import { cleanup, render } from "@testing-library/vue";

import { ChartOptions } from "chart.js/auto";
import { Line } from "vue-chartjs";

import {
	JestTestChartOptions,
	genericChartScenarioBase,
} from "../../__data__/data";
import { integrationAllowed } from "../__utils__";

afterEach(() => {
	cleanup();
});

(integrationAllowed("vue") ? describe : describe.skip)("vue.js", () => {
	it("renders chart canvas in the document", () => {
		const wrapper = render(Line, {
			props: {
				data: genericChartScenarioBase.configuration.data,
				options: JestTestChartOptions as ChartOptions<"line">,
			},
		});

		const canvas = wrapper.getByRole("img");

		expect(canvas).toBeTruthy();
	});
});
