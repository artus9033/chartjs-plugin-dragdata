import type {
	ChartConfiguration,
	ChartData,
	ChartOptions,
	ChartType,
	ChartTypeRegistry,
	Point,
	Chart as TChart,
} from "chart.js";
import _ from "lodash";

import { ChartDataItemType } from "../../../src";
import {
	JestTestChartOptions,
	genericChartScenarioBase,
} from "../../__data__/data";
import { Point2DObject } from "../../__utils__/testTypes";
import {
	UnitTestCategory,
	isTestsConfigWhitelistItemAllowed,
} from "../../__utils__/testsConfig";

export const DEFAULT_TEST_CHART_INSTANCE_WIDTH = 400; // px
export const DEFAULT_TEST_CHART_INSTANCE_HEIGHT = 800; // px

export type SetupChartInstanceOptions<T extends ChartType> = Partial<{
	canvasWidth: number;
	canvasHeight: number;
	chartData: ChartConfiguration<T>["data"];
}>;

/**
 * Sets up a partially-mocked Chart.js chart with given options.
 * @param chartType the type of the chart
 * @param customOptions custom options that will be merged (with precedence) into the default options
 * @param parameterOverrides custom parameter overrides, controlling the canvas size and chart data
 * @returns
 */
export function setupChartInstance<T extends keyof ChartTypeRegistry>(
	chartType: T,
	customOptions?: ChartOptions<T>,
	{
		canvasWidth = DEFAULT_TEST_CHART_INSTANCE_WIDTH,
		canvasHeight = DEFAULT_TEST_CHART_INSTANCE_HEIGHT,
		chartData = genericChartScenarioBase.configuration.data as any,
	}: SetupChartInstanceOptions<T> = {},
): TChart<T> {
	const canvas = document.createElement("canvas");
	canvas.style.width = `${canvasWidth}px`;
	canvas.style.height = `${canvasHeight}px`;

	var ctx = canvas.getContext("2d")!;

	const chart = new Chart<T>(ctx, {
		type: chartType,
		data: _.cloneDeep(chartData),
		options: _.merge(
			// deep cloning is needed to avoid former tests mutating next tests' data
			_.cloneDeep(JestTestChartOptions),
			_.cloneDeep(customOptions ?? {}),
		) as any,
	});

	// ensure these properties are initialized for chart.js helpers to be able to work properly
	chart.width = canvasWidth;
	chart.height = canvasHeight;

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	return chart;
}

/**
 * Returns a boolean indicating whether `category` of unit tests is allowed to be executed by the current configuration.
 * @param category the category to be tested
 * @returns `true` if allowed to run, `false` otherwise
 */
export function unitTestCategoryAllowed(category: UnitTestCategory): boolean {
	return isTestsConfigWhitelistItemAllowed(
		"unit",
		"whitelistedTestCategories",
		category,
	);
}

/**
 * Since data points' shapes in test cases differ, this function performs a valid comparison
 * of only these coordinates that are applicable, to a universally-passed-as-2D-object baseline.
 *
 * For instance, the bar chart only has one dimension that is applicable, and it depends on the `indexAxis` parameter.
 *
 * @param configuration the configuration: expected, actual data points & indexAxis information
 */
export function assertPointsEqual({
	expected,
	actual,
	indexAxis,
}: {
	/** The baseline expected point coordinates as a 2D point; only the applicable coordinate will be used for actual assertion based on the shape of `actual` */
	expected: Point2DObject;
	/** The actual point to be checked for validity */
	actual: Point;
	/** Specifies the configured chart index axis; this parameter picks the proper coordinate to be compared from the baseline (which is 2D) when the actual point is 1D */
	indexAxis: "x" | "y";
}) {
	// check the actual data point shape
	const {
		isDataPointShape2DObject,
		isDataPointShapePair,
		isDataPointShapeScalar,
	} = getChartDataPointShape({ datasets: [{ data: [actual] }] });

	if (isDataPointShape2DObject) {
		// Point2DObject case - no conversion needed
		expect(actual).toStrictEqual(expected);
	} else if (isDataPointShapePair) {
		// [number, number] case - convert expected Point2DObject to [x, y]
		expect(actual).toStrictEqual([expected.x, expected.y]);
	} else if (isDataPointShapeScalar) {
		// scalar case - pick the index axis coordinate from the expected Point2DObject and assert
		expect(actual).toStrictEqual(indexAxis === "x" ? expected.y : expected.x);
	}
}

/**
 * Converts the pased in `point2D` to a format compatible with the chart of type `type`.
 *
 * @param point2D the point to be converted
 * @param type the type of the chart
 */
export function dataPointCompatFromPoint2D(
	point2D: Point2DObject,
	type: ChartType,
): Point2DObject | [number, number] {
	switch (type) {
		case "bar":
			return [point2D.x, point2D.y];

		default:
		case "line":
			return point2D;
	}
}

/**
 * Converts the pased in `point` to the `Point2DObject` format.
 * NOTE: for scalars, which have no interpretation in 2D in this case, both `x` & `y` are set to the value of the scalar.
 *
 * @param point the point to be converted to a `Point2DObject`
 */
export function dataPointCompatToPoint2D(
	point: ChartDataItemType<ChartType>,
): Point2DObject {
	const { isDataPointShape2DObject, isDataPointShapePair } =
		getChartDataPointShape({ datasets: [{ data: [point] }] });

	if (isDataPointShape2DObject) {
		return point as Point2DObject;
	} else if (isDataPointShapePair) {
		return {
			x: (point as [number, number])[0],
			y: (point as [number, number])[1],
		};
	} else {
		// scalar; this has no interpretation, so it is treated as a Point2DObject with the same value in both properties
		return { x: point as number, y: point as number };
	}
}

/**
 * Checks the shape of a single data point in the `data` Chart.js data (using the first data point inside the first dataset).
 * @param data the Chart.js chart data object
 * @returns a struct of booleans specifying the shape of a data point
 */
export function getChartDataPointShape(data: ChartData) {
	const _sampleDataPoint = data?.datasets[0].data[0];

	const isDataPointShapeScalar = typeof _sampleDataPoint === "number",
		isDataPointShapePair =
			!isDataPointShapeScalar && Array.isArray(_sampleDataPoint),
		isDataPointShape2DObject = !isDataPointShapeScalar && !isDataPointShapePair;

	return {
		isDataPointShapeScalar,
		isDataPointShapePair,
		isDataPointShape2DObject,
	};
}

export function maxValueCustomMode(
	chart: TChart,
	e: MouseEvent,
	options: ChartOptions,
	useFinalPosition: boolean,
) {
	const nearestItems = Chart.Interaction.modes.nearest(
		chart,
		e,
		{ axis: "x", intersect: false },
		useFinalPosition,
	);

	let maxItem = null,
		maxValue = -Infinity;
	for (const item of nearestItems) {
		const value = (
			chart.data.datasets[item.datasetIndex].data[item.index] as Point
		).y;

		if (value > maxValue) {
			maxValue = value;
			maxItem = item;
		}
	}

	return maxItem ? [maxItem] : [];
}
