import { ChartConfiguration } from "chart.js";

import { GenericDragTestParams } from "../../e2e/__fixtures__";
import { TestSuiteIdentifier } from "../../e2e/__utils__/types";
import { DatasetPointSpec } from "../testTypes";
import Offset2D from "./Offset2D";
import Point2D from "./Point2D";
import { AxisSpec } from "./axisSpec";

export type TestScenarioStepsGroup<GroupNameType> = {
	/** the name of this group of interaction steps */
	groupName: GroupNameType;
	/** definitions of interaction steps */
	steps: TestScenarioStep[];
	/** whether this group of interactions should be skipped */
	shouldBeSkipped: boolean;
	/** whether tests in this group should involve screenshot snapshot testing */
	shouldAssertScreenshot: boolean;
};

export type TestScenarioStep = {
	axisSpec: AxisSpec;
} & Pick<
	GenericDragTestParams,
	| "dragPointSpec"
	| "dragDestPointSpecOrStartPointOffset"
	| "expectedDestPointSpecOverride"
>;

export type TestScenario<GroupNameType, bSealed extends boolean = false> = {
	/**
	 * The configuration to pass to the tested chart instance
	 */
	configuration: Partial<ChartConfiguration>;
	/**
	 * Definitions of groups of interaction steps
	 */
	stepGroups: TestScenarioStepsGroup<GroupNameType>[];
	/**
	 * Precision for rounding the values on the grid
	 */
	roundingPrecision: number;
	/**
	 * Whether data.ts should run post-processing on the 'configuration'
	 * object (e.g. calculate min/max limits for scales)
	 */
	postprocessConfiguration?: boolean;
	/**
	 * Whether x is categorical (not linear, thus not draggable)
	 */
	isCategoricalX?: boolean;
	/**
	 * Whether y is categorical (not linear, thus not draggable)
	 */
	isCategoricalY?: boolean;
	/**
	 * Browsers that are not supported by this test scenario
	 */
	unsupportedBrowsers?: Array<"chromium" | "firefox" | "webkit" | "mobile">;
	/**
	 * Whether to skip E2E testing and just use the scenario as data source for HTML demo
	 */
	skipE2ETesting?: boolean;
	/**
	 * Custom onDrag callback to be stringified & eval-ed on page side
	 */
	onDrag?: bSealed extends true
		? string
		: (
				e: MouseEvent,
				datasetIndex: number,
				index: number,
				value: [number, number],
			) => void;
	/**
	 * Forces an axis to be the only supported draggable axis, effectively skipping
	 * all generated test cases when a different / incompatible axis could be tested for.
	 *
	 * @default undefined ("both")
	 */
	forceDraggableAxis?: AxisSpec;
	/**
	 * Specifies whether this page should be excluded from a given test suite.
	 */
	excludedTestSuites?: TestSuiteIdentifier[];
};

export function describeDatasetPointSpecOrPoint(
	datasetPointSpecOrPoint: DatasetPointSpec | Point2D | Offset2D,
): string {
	if (
		datasetPointSpecOrPoint instanceof Point2D ||
		datasetPointSpecOrPoint instanceof Offset2D
	) {
		return datasetPointSpecOrPoint.toString();
	} else {
		return `dataset #${datasetPointSpecOrPoint.datasetIndex} point #${datasetPointSpecOrPoint.index}${datasetPointSpecOrPoint.additionalOffset?.shouldBeLogged ? ` (with ${datasetPointSpecOrPoint.additionalOffset.toString()})` : ""}`;
	}
}
