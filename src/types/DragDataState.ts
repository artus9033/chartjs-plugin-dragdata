import type {
	AnimationSpec,
	CartesianScaleOptions,
	ChartType,
	InteractionItem,
} from "chart.js";

export type DragDataState = {
	element: InteractionItem | null;
	yAxisID: string;
	xAxisID: string;
	rAxisID: string;
	type: ChartType | undefined;
	stacked: CartesianScaleOptions["stacked"];
	floatingBar: boolean;
	initValue: number;
	curDatasetIndex: number | undefined;
	curIndex: number | undefined;
	eventSettings: AnimationSpec<ChartType> | false | undefined;
	isDragging: boolean;
};
