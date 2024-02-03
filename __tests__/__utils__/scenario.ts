import { ChartConfiguration } from "chart.js";

import { GenericDragTestParams } from "../e2e/__fixtures__";
import Offset2D from "./Offset2D";
import Point2D from "./Point2D";
import { AxisSpec } from "./axisSpec";
import { DatasetPointSpec } from "./testTypes";

export type TestScenarioStep = { axisSpec: AxisSpec } & Pick<
	GenericDragTestParams,
	| "dragPointSpec"
	| "dragDestPointSpecOrStartPointOffset"
	| "expectedDestPointSpecOverride"
>;

export type TestScenario = {
	/** the configuration to pass to the tested chart instance */
	configuration: Partial<ChartConfiguration>;
	/** definitions of interaction steps */
	steps: TestScenarioStep[];
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
