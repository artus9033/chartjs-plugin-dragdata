import { exportsForTesting } from "../../dist/chartjs-plugin-dragdata-test-browser";
import { isWhitelistItemAllowed } from "../__utils__/testsConfig";

const { roundValue } = exportsForTesting;

(isWhitelistItemAllowed("unit", "whitelistedTestCategories", "roundValue")
	? describe
	: describe.skip)("roundValue", () => {
	test("should correctly round to the specified decimal places", () => {
		expect(roundValue(1.23456, 2)).toBe(1.23);
		expect(roundValue(1.23456, 3)).toBe(1.235);
		expect(roundValue(1.23456, 0)).toBe(1);
		expect(roundValue(1.23456, 0)).toBe(1);
	});

	test("should return the original value if pos is NaN", () => {
		expect(roundValue(1.23456, NaN)).toBe(1.23456);
	});

	test("should handle NaN values", () => {
		expect(roundValue(-1.23456, 2)).toBe(-1.23);
		expect(roundValue(-1.23456, 3)).toBe(-1.235);
	});

	test("should handle negative numbers", () => {
		expect(roundValue(-1.23456, 2)).toBe(-1.23);
		expect(roundValue(-1.23456, 3)).toBe(-1.235);
	});

	test("should handle rounding up and down", () => {
		expect(roundValue(1.5, 0)).toBe(2);
		expect(roundValue(1.4, 0)).toBe(1);
	});
});
