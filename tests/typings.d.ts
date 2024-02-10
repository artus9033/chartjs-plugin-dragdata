import type { Chart, ChartConfiguration } from "chart.js";
import type Point2D from "./tests/__utils__/Point2D";

import type { AxisSpec } from "./__utils__/structures/axisSpec";

interface CustomMatchers<R = unknown> {
	pointsToBeClose(p2: Point2D, maxDistance?: number): R;
}

interface CustomMatchersJest<R = unknown> {
	pointsToBeClose(p2: Point2D, maxDistance?: number): R;
}

declare global {
	interface TestChartSetupOptions {
		isTest: boolean;
		disablePlugin?: boolean;
		draggableAxis: AxisSpec;
		magnetImplSerialized?: string;
		roundingPrecision?: number;
		configurationOverrides: Partial<ChartConfiguration>;
	}

	// the test instance exposed by all test pages - typing for tests' code
	interface Window {
		testedChart: Chart;
		isTestReady?: boolean;
		setupTest: (options: TestChartSetupOptions) => void;
	}

	// augment Jest matchers
	namespace jest {
		interface Expect extends CustomMatchers {}
		interface Matchers<R> extends CustomMatchers<R> {}
		interface InverseAsymmetricMatchers extends CustomMatchers {}
	}

	// augment Playwright matchers
	namespace PlaywrightTest {
		interface Matchers<R> extends CustomMatchers<R> {}
		interface MakeMatchers<R> extends CustomMatchers<R> {}
	}

	var Chart: typeof Chart;
}
