import Offset2D from "./structures/Offset2D";

export type DatasetPointSpec = {
	datasetIndex: number;
	index: number;
	additionalOffset?: Offset2D;
};

export type Point2DObject = { x: number; y: number };
export type Point2DArray = [x: number, y: number];
