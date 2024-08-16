import { ChartType, Plugin } from "chart.js";

import {
	DataPointDraggingConfiguration,
	DatasetDraggingConfiguration,
	DragDataPluginConfiguration,
	ScaleDraggingConfiguration,
} from "./types/Configuration";

declare module "chart.js" {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	export interface ChartDatasetProperties<TType extends ChartType, TData> {
		/**
		 * Configuration controlling the dragdata plugin behaviour for a given dataset.
		 *
		 * For information regarding the mechanics, please consult `PluginConfiguration`.
		 *
		 * @see DragDataPluginConfiguration
		 */
		dragData?: DatasetDraggingConfiguration | boolean;
	}

	export interface PluginOptionsByType<TType extends ChartType> {
		/**
		 * Configuration controlling the dragdata plugin behaviour.
		 * The scope depends on where the configuration is applied. The possible locations are:
		 * - per-chart (inside `plugins` section in chart configuration)
		 * - per-scale (inside)
		 * - per-dataset
		 * - per-data-point
		 *
		 * Each next level from the listing above overrides any preceding configuration by entirely ignoring it.
		 *
		 * Example 1: applying a per-chart `round: 2` property and for one of the points `round: 3` will cause this point
		 * to round to `3` decimal places and all other points of this chart to `2` decimal places.
		 *
		 * Example 2: applying a per-chart `round: 2` property and for one of the points `false` (disabling the plugin)
		 * will disable the plugin for that poi
		 * nt.
		 *
		 * To entirely disable the plugin, pass `false`. By default, the plugin is enabled for every data point but only
		 * on the y-axis, unless a lower-level configuration specifies otherwise.
		 */
		dragData?: DragDataPluginConfiguration<TType> | boolean;
	}

	export interface CoreScaleOptions {
		/**
		 * Configuration controlling the dragdata plugin behaviour for a given scale.
		 * If `true`, the plugin is enabled for this scale, otherwise it is disabled.
		 *
		 * The default value depends on the scale: for the y-axis, it is `true` by default,
		 * while it is `false` by default otherwise (in which case `true` needs to be
		 * explicitly specified to enable dragging on the axis).
		 */
		dragData?: ScaleDraggingConfiguration | boolean;
	}

	export interface Point {
		/**
		 * Configuration controlling the dragdata plugin behaviour for a given data point.
		 *
		 * For information regarding the mechanics, please consult `PluginConfiguration`.
		 *
		 * @see DragDataPluginConfiguration
		 */
		dragData?: DataPointDraggingConfiguration | false;
	}
}

declare const ChartJSDragDataPlugin: Plugin;

export default ChartJSDragDataPlugin;
