import { expect as playwrightExpect } from "playwright-test-coverage";
import { ExpectMatcherState } from "playwright/test";

import Point2D from "../__utils__/Point2D";
import { euclideanDistance } from "../__utils__/cartesian";

type PlaywrightMatcherReturnType = {
	message: () => string;
	pass: boolean;
	name?: string;
	expected?: unknown;
	actual?: any;
	log?: string[];
};
type PlaywrightMatchersDef = Record<
	string,
	(
		this: ExpectMatcherState,
		receiver: any,
		...args: any[]
	) => PlaywrightMatcherReturnType | Promise<PlaywrightMatcherReturnType>
>;

type JestExpectExtendMap = Parameters<typeof expect.extend>[0];

// intersection of Playwright & Jest matchers extension types
type ExpectExtendMap = JestExpectExtendMap & PlaywrightMatchersDef;

const customMatchers: ExpectExtendMap = {
	pointsToBeClose(p1: Point2D, p2: Point2D, maxDistance: number = 2) {
		const absDistance = Math.abs(euclideanDistance(p1, p2)),
			pass = absDistance <= maxDistance;

		if (pass) {
			return {
				message: () =>
					`Expected the points to be absolutely-distant by at most: ${this.utils.printExpected(
						maxDistance,
					)}\nActual distance: ${this.utils.printReceived(absDistance)}`,
				pass: true,
			};
		}

		return {
			message: () =>
				`Expected the points to be absolutely-distant by at most: ${this.utils.printExpected(
					maxDistance,
				)}\nActual distance: ${this.utils.printReceived(absDistance)}\n\n${this.utils.diff(
					maxDistance,
					absDistance,
				)}`,
			pass: false,
		};
	},
};

playwrightExpect.extend(customMatchers);

if (typeof jest !== "undefined") {
	expect.extend(customMatchers);
}

export default () => {};
