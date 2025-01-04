import "../../scripts/setupEnv";

import {
	ExpectMatcherState,
	expect as playwrightExpect,
} from "playwright/test";

import { euclideanDistance } from "../__utils__/cartesian";
import Point2D from "../__utils__/structures/Point2D";

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
	pointsToBeClose(
		p1: Point2D,
		p2: Point2D,
		maxDistancePx: number = 2,
		additionalInfo?: string,
	) {
		const absDistance = Math.abs(euclideanDistance(p1, p2)),
			pass = absDistance <= maxDistancePx;

		if (pass) {
			return {
				message: () =>
					`Expected the points to be absolutely-distant by at most: ${this.utils.printExpected(
						maxDistancePx,
					)}\n` + `Actual distance: ${this.utils.printReceived(absDistance)}`,
				pass: true,
			};
		}

		return {
			message: () =>
				`Expected the points to be absolutely-distant by at most: ${this.utils.printExpected(
					maxDistancePx,
				)}\n` +
				`Actual distance: ${this.utils.printReceived(absDistance)}\n\n` +
				`The points:\n\t> expected: ${this.utils.printExpected(p2.toString())}\n\t> actual: ${this.utils.printExpected(p1.toString())}` +
				`${additionalInfo ? `\n\nAdditional information:\n${additionalInfo}` : ""}`,
			pass: false,
		};
	},
};

playwrightExpect.extend(customMatchers);

if (typeof jest !== "undefined") {
	expect.extend(customMatchers);
}
