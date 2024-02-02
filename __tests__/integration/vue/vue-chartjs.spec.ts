import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "vue-chartjs";

import { cleanup, render } from "@testing-library/vue";

import { TestChartOptions, data } from "../../__data__/data";

ChartJS.register(...registerables);

afterEach(() => {
	cleanup();
});

test("renders chart canvas in the document", () => {
	const wrapper = render(Line, {
		props: {
			data,
			options: TestChartOptions,
		},
	});

	const canvas = wrapper.getByRole("img");

	expect(canvas).toBeTruthy();
});
