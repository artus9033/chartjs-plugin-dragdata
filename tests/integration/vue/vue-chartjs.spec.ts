import "chart.js/auto";

import { Line } from "vue-chartjs";

import { cleanup, render } from "@testing-library/vue";

import {
	TestChartOptions,
	genericChartScenarioBase,
} from "../../__data__/data";
import { integrationAllowed } from "../__utils__/utils";

afterEach(() => {
	cleanup();
});

(integrationAllowed("vue") ? describe : describe.skip)("vue.js", () => {
	it("renders chart canvas in the document", () => {
		const wrapper = render(Line, {
			props: {
				data: genericChartScenarioBase.configuration.data,
				options: TestChartOptions,
			},
		});

		const canvas = wrapper.getByRole("img");

		expect(canvas).toBeTruthy();
	});
});
