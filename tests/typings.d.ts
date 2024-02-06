import type { Chart } from "chart.js";
import type Point2D from "./tests/__utils__/Point2D";

interface CustomMatchers<R = unknown> {
	pointsToBeClose(p2: Point2D, maxDistance?: number): R;
}

interface CustomMatchersJest<R = unknown> {
	pointsToBeClose(p2: Point2D, maxDistance?: number): R;
}

declare global {
	// the test instance exposed by all test pages - typing for tests' code
	interface Window {
		test: Chart;
		isTestReady?: boolean;
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
