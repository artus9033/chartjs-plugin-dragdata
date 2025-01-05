import { Chart, ChartType } from "chart.js";
import { getRelativePosition } from "chart.js/helpers";
import type { Mock } from "jest-mock";
import _ from "lodash";

import {
	type DragDataEvent,
	calcRadialLinear,
} from "../../../dist/test/chartjs-plugin-dragdata-test";
import { genericChartScenarioBase } from "../../__data__/data";
import { isTestsConfigWhitelistItemAllowed } from "../../__utils__/testsConfig";
import { setupChartInstance } from "../__utils__/utils";

const CHART_CENTER_POS_X = 75;
const CHART_CENTER_POS_Y = 80;

jest.mock("chart.js/helpers", () => ({
	...jest.requireActual("chart.js/helpers"),
	getRelativePosition: jest.fn(() => ({
		x: CHART_CENTER_POS_X,
		y: CHART_CENTER_POS_Y,
	})),
}));

const rAxisID = "y";

(isTestsConfigWhitelistItemAllowed(
	"unit",
	"whitelistedTestCategories",
	"calcRadialLinear",
)
	? describe
	: describe.skip)("calcRadialLinear", () => {
	for (const chartType of ["radar", "polarArea"] as ChartType[]) {
		let chartInstance: Chart;
		let mouseEvent: DragDataEvent;

		describe(`${chartType} chart`, () => {
			beforeEach(() => {
				chartInstance = setupChartInstance(chartType, {
					plugins: {
						dragData: {
							round: 4,
						},
					},
					scales: {
						[rAxisID]: {
							max: 100,
							min: 0,
							reverse: false,
						},
					},
				});

				// mock the r axis
				const MOCK_DRAWING_AREA = 2000,
					MOCK_MAX = 100,
					MOCK_MIN = 0;
				chartInstance.scales[rAxisID] = {
					max: MOCK_MAX,
					min: MOCK_MIN,
					// @ts-ignore next line
					drawingArea: MOCK_DRAWING_AREA,
					// @ts-ignore next line
					getPointPositionForValue: jest.fn((index, _value) => {
						let angle =
							// polar area chart has all angles rotated by + Math.PI/2; for testing, we don't want that
							// so as to have answers identical for both radar & polarArea
							index *
							((2 * Math.PI) /
								genericChartScenarioBase.configuration.data.labels.length);

						angle = angle % (2 * Math.PI);

						if (angle < 0) {
							angle += 2 * Math.PI;
						}

						return {
							angle,
						};
					}),
					getValueForDistanceFromCenter: jest.fn((d) => {
						let v = 0;
						let scalingFactor = MOCK_DRAWING_AREA / (MOCK_MAX - MOCK_MIN);
						if (chartInstance.scales[rAxisID].options.reverse) {
							v = MOCK_MAX - d / scalingFactor;
						} else {
							v = MOCK_MIN + d / scalingFactor;
						}

						return v;
					}),
					options: { reverse: false } as any,
					xCenter: CHART_CENTER_POS_X,
					yCenter: CHART_CENTER_POS_Y,
				};

				// if the mocked chart.js/helpers defaultGetRelativePositionMock export was overridden, reset it to the default mock
				(getRelativePosition as Mock).mockImplementation(
					jest.fn(() => ({
						x: CHART_CENTER_POS_X,
						y: CHART_CENTER_POS_Y,
					})),
				);

				mouseEvent = {
					clientX: 50,
					clientY: 200,
					type: "click",
				} as any;
			});

			test.each(
				_.range(genericChartScenarioBase.configuration.data.labels.length),
			)(
				"should calculate 0 when drag event occurs in the center of the chart",
				(curIndex) => {
					const value = calcRadialLinear(
						mouseEvent,
						chartInstance,
						curIndex,
						rAxisID,
					);

					expect(value).toEqual(0);
				},
			);

			it("should calculate the correct value for data point 3 / 6 (south) dragged to the bottom", () => {
				const curIndex = 2;

				(getRelativePosition as Mock).mockImplementation(() => ({
					x: CHART_CENTER_POS_X,
					y: CHART_CENTER_POS_Y * 4.74, // to the bottom
				}));

				const value = calcRadialLinear(
					mouseEvent,
					chartInstance,
					curIndex,
					rAxisID,
				);

				expect(value).toBeCloseTo(14.96, 2);
			});

			it("should calculate the correct value for data point 3 / 6 (south) dragged to the bottom if axis is reversed", () => {
				chartInstance.scales[rAxisID].options.reverse = true;

				const curIndex = 2;

				(getRelativePosition as Mock).mockImplementation(() => ({
					x: CHART_CENTER_POS_X,
					y: CHART_CENTER_POS_Y * 4.74, // to the bottom
				}));

				const value = calcRadialLinear(
					mouseEvent,
					chartInstance,
					curIndex,
					rAxisID,
				);

				expect(value).toBeCloseTo(chartInstance.scales[rAxisID].max - 14.96, 2);
			});

			it("should calculate 0 for data point 3 / 6 (south) dragged above chart center", () => {
				const curIndex = 2;

				(getRelativePosition as Mock).mockImplementation(() => ({
					x: CHART_CENTER_POS_X,
					y: CHART_CENTER_POS_Y - 300, // to the top
				}));

				const value = calcRadialLinear(
					mouseEvent,
					chartInstance,
					curIndex,
					rAxisID,
				);

				expect(value).toEqual(0);
			});

			it("should calculate 0 for data point 5 / 6 (north-west) dragged to the right", () => {
				const curIndex = 4;

				(getRelativePosition as Mock).mockImplementation(() => ({
					x: CHART_CENTER_POS_X - 300,
					y: CHART_CENTER_POS_Y,
				}));

				const value = calcRadialLinear(
					mouseEvent,
					chartInstance,
					curIndex,
					rAxisID,
				);

				expect(value).toEqual(15);
			});

			it("should calculate 0 for polarArea data point 3 / 6 (south) dragged above chart center", () => {
				// since polarArea charts have axes rotated by Math.PI / 2, we need to pick a different axis
				// to have a proper environment for this scenario to work
				const curIndex = chartType === "polarArea" ? 5 : 0;

				(getRelativePosition as Mock).mockImplementation(() => ({
					x: CHART_CENTER_POS_X,
					y: CHART_CENTER_POS_Y * 4.74, // to the top
				}));

				const value = calcRadialLinear(
					mouseEvent,
					chartInstance,
					curIndex,
					rAxisID,
				);

				expect(value).toEqual(0);
			});

			it("should return 0 when the dot product is negative", () => {
				(getRelativePosition as Mock).mockImplementation(() => ({
					x: 25,
					y: 25,
				}));

				const curIndex = 0;

				const value = calcRadialLinear(
					mouseEvent,
					chartInstance,
					curIndex,
					rAxisID,
				);

				expect(value).toBe(0);
			});

			it("should clamp the value to the max scale value if dragged out of bounds on x axis", () => {
				(getRelativePosition as Mock).mockImplementation(() => ({
					x: 30000,
					y: CHART_CENTER_POS_Y,
				}));

				const curIndex = 0;

				const value = calcRadialLinear(
					mouseEvent,
					chartInstance,
					curIndex,
					rAxisID,
				);

				expect(value).toBe(chartInstance.scales[rAxisID].max);
			});

			it("should clamp the value to the min scale value if dragged out of bounds on x axis", () => {
				(getRelativePosition as Mock).mockImplementation(() => ({
					x: -30000,
					y: CHART_CENTER_POS_Y,
				}));

				const curIndex = 0;

				const value = calcRadialLinear(
					mouseEvent,
					chartInstance,
					curIndex,
					rAxisID,
				);

				expect(value).toBe(chartInstance.scales[rAxisID].min);
			});

			it("should clamp the value to the max scale value if dragged out of bounds on y axis", () => {
				(getRelativePosition as Mock).mockImplementation(() => ({
					x: CHART_CENTER_POS_X,
					y: 30000,
				}));

				const curIndex = 1;

				const value = calcRadialLinear(
					mouseEvent,
					chartInstance,
					curIndex,
					rAxisID,
				);

				expect(value).toBe(chartInstance.scales[rAxisID].max);
			});

			it("should clamp the value to the min scale value if dragged out of bounds on y axis", () => {
				(getRelativePosition as Mock).mockImplementation(() => ({
					x: CHART_CENTER_POS_X,
					y: -30000,
				}));

				const curIndex = 1;

				const value = calcRadialLinear(
					mouseEvent,
					chartInstance,
					curIndex,
					rAxisID,
				);

				expect(value).toBe(chartInstance.scales[rAxisID].min);
			});
		});
	}
});
