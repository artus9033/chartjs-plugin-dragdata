import { ChartConfiguration } from "chart.js";

import { GenericDragTestParams } from "../../e2e/__fixtures__";
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
};

export type TestScenarioStep = {
	axisSpec: AxisSpec;
} & Pick<
	GenericDragTestParams,
	| "dragPointSpec"
	| "dragDestPointSpecOrStartPointOffset"
	| "expectedDestPointSpecOverride"
>;

export type TestScenario<GroupNameType> = {
	/** the configuration to pass to the tested chart instance */
	configuration: Partial<ChartConfiguration>;
	/** definitions of groups of interaction steps */
	stepGroups: TestScenarioStepsGroup<GroupNameType>[];
	/** precision for rounding the values on the grid */
	roundingPrecision: number;
	/** whether x is categorical (not linear, thus not draggable) */
	isCategoricalX?: boolean;
	/** whether y is categorical (not linear, thus not draggable) */
	isCategoricalY?: boolean;
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
		return `dataset #${datasetPointSpecOrPoint.datasetIndex} point #${datasetPointSpecOrPoint.index}`;
	}
}
