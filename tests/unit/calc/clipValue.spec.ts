import { clipValue } from "../../../dist/test/chartjs-plugin-dragdata-test";
import { isTestsConfigWhitelistItemAllowed } from "../../__utils__/testsConfig";

(isTestsConfigWhitelistItemAllowed(
	"unit",
	"whitelistedTestCategories",
	"clipValue",
)
	? describe
	: describe.skip)("clipValue", () => {
	it("should return the value if it is within [min, max] range", () => {
		expect(clipValue(5.24, 1, 10)).toBe(5.24);
		expect(clipValue(1, 1, 10)).toBe(1);
		expect(clipValue(10, 1, 10)).toBe(10);
	});

	it("should return the minimum value if value < min", () => {
		expect(clipValue(0.9999, 1, 10)).toBe(1);
		expect(clipValue(-5.2, 1, 10)).toBe(1);
	});

	it("should return the maximum value if value > max", () => {
		expect(clipValue(10.0001, 1, 10)).toBe(10);
		expect(clipValue(17.74, 1, 10)).toBe(10);
	});
});
