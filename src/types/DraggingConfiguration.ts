export type DraggingConfiguration = Record<
	| "chartDraggingDisabled"
	| "datasetDraggingDisabled"
	| "xAxisDraggingDisabled"
	| "yAxisDraggingDisabled"
	| "dataPointDraggingDisabled",
	boolean
>;

export type AxisDraggingConfiguration = Pick<
	DraggingConfiguration,
	"xAxisDraggingDisabled" | "yAxisDraggingDisabled"
>;
