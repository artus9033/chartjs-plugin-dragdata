import type { ChartType } from "chart.js";

import { ChartDataItemType } from "./ChartJSTypes";
import { DragEventCallback } from "./EventTypes";

export type OptionalPluginConfiguration<TType extends ChartType> =
	| PluginConfiguration<TType>
	| undefined;

/**
 * Core configuration, used as a common base for other specialized configuration types.
 */
type CoreConfiguration = {
	/**
	 * Rounds the values to `round` decimal places.
	 *
	 * Example: `1`, would cause `0.1234` to be rounded to `0.1`.
	 */
	round: number;

	/**
	 * Whether to show the tooltip while dragging.
	 *
	 * @default true
	 */
	showTooltip: boolean;
};

// per-scale configuration; docstring located in typeAugmentations.d.ts to be visible to the end users
export type ScaleDraggingConfiguration = boolean;

// per-dataset configuration; docstring located in typeAugmentations.d.ts to be visible to the end users
export type DatasetDraggingConfiguration = boolean;

// per-data-point configuration; docstring located in typeAugmentations.d.ts to be visible to the end users
export type DataPointDraggingConfiguration = boolean;

// plugin (per-chart) configuration; docstring located in typeAugmentations.d.ts to be visible to the end users
export type PluginConfiguration<TType extends ChartType = ChartType> =
	CoreConfiguration & {
		/**
		 * Whether to allow for dragging on the x-axis.
		 *
		 * **Note**: This solely works for continuous, numerical x-axis scales (no categories or dates)!
		 * **Disabled by default.**
		 *
		 * @default `false`
		 */
		dragX: boolean;

		/**
		 * Whether to allow for dragging on the y-axis.
		 *
		 * @default `true`
		 */
		dragY: boolean;

		/**
		 * Callback fired during the drag numerous times.
		 *
		 * If the callback returns `false`, the drag is prevented and the new value is discarded.
		 *
		 * May be used e.g. to process the data point value or to prevent the drag.
		 *
		 * **Note: this solely works for continous, numerical x-axis scales (no categories or dates)**
		 *
		 * @example
		 * {
		 * 	dragData: {
		 * 		onDragStart: () => {
		 * 			if (element.datasetIndex === 0 && element.index === 0) {
		 * 				// this would prohibit dragging the first datapoint in the first
		 * 				// dataset entirely
		 *	 			return false
		 * 			}
		 * 		}
		 * 	}
		 * }
		 */
		onDragStart: DragEventCallback<TType>;

		/**
		 * Callback fired during the drag numerous times.
		 *
		 * If the callback returns `false`, the drag is prevented and the previous
		 * value of the data point is still effective while the new one is discarded.
		 *
		 * May be used e.g. to process the data point value or to prevent the drag.
		 *
		 * @example
		 * {
		 * 	dragData: {
		 * 		onDragStart: () => {
		 * 			if (element.datasetIndex === 0 && element.index === 0) {
		 * 				// you may control the range in which data points are allowed to be
		 * 				// dragged by returning `false` in this callback
		 * 				if (value < 0) return false // this only allows positive values
		 * 				if (datasetIndex === 0 && index === 0 && value > 20) return false
		 * 			}
		 * 		}
		 * 	}
		 * }
		 */
		onDrag: DragEventCallback<TType>;

		/**
		 * Callback fired after a drag completes.
		 *
		 * May be used e.g. to store the final data point value (after dragging)
		 * or perform any other desired side effects.
		 */
		onDragEnd: DragEventCallback<TType>;

		/**
		 * The 'magnet' function to apply to the dragged value. Can be used to round the values, e.g. snap them to the grid.
		 */
		magnet: {
			to: (value: ChartDataItemType<TType>) => ChartDataItemType<TType>;
		};
	};
