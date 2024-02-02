import Point2D from "./Point2D";
import { AxisSpec } from "./axisSpec";
import { DatasetPointSpec } from "./testTypes";

export type TestScenarioStep = {
	axisSpec: AxisSpec;
	dragPointSpec: DatasetPointSpec;
	destRefPointOrSpec: DatasetPointSpec | Point2D;
};
export type TestScenario = TestScenarioStep[];

export function describeDatasetPointSpecOrPoint(
	datasetPointSpecOrPoint: DatasetPointSpec | Point2D,
): string {
	if (datasetPointSpecOrPoint instanceof Point2D) {
		return datasetPointSpecOrPoint.toString();
	} else {
		return `dataset #${datasetPointSpecOrPoint.datasetIndex} point #${datasetPointSpecOrPoint.index}`;
	}
}
