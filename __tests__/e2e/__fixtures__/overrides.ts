import { test as base } from "playwright-test-coverage";

export const test = base.extend({
	page: async ({ page }, use) => {
		// redirect the chartjs-plugin-dragdata bundle to the test one for running tests
		await page.route(/assets\/chartjs-plugin-dragdata.js$/, (route) =>
			route.continue({
				url: route
					.request()
					.url()
					.replace(
						/assets\/chartjs-plugin-dragdata.js$/,
						"../dist/chartjs-plugin-dragdata-test-browser.js",
					),
			}),
		);

		// eslint-disable-next-line
		use(page);
	},
});

export const it = test;
export const expect = test.expect;
