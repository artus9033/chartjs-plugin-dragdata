// this file is not a .d.ts in src/ file so as for rollup to bundle it along with other ts files
import { ChartType, Plugin } from "chart.js";

import {
	DataPointDraggingConfiguration,
	DatasetDraggingConfiguration,
	PluginConfiguration,
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
		 * @see PluginConfiguration
		 */
		dragData?: DatasetDraggingConfiguration | boolean;
	}

	export interface PluginOptionsByType<TType extends ChartType> {
		/**
		 * Configuration controlling the dragdata plugin behaviour.
		 * The scope depends on where the configuration is applied. The possible locations are:
		 * - per-chart (inside `plugins` section in chart configuration)
		 * - per-scale (inside a scale's configuration)
		 * - per-dataset (inside a dataset's configuration)
		 * - per-data-point (inside a data point's object, for object data points only)
		 *
		 * Each next level from the listing above overrides any preceding configuration (if applicable with respect to the configuration options available).
		 *
		 * To entirely disable the plugin, pass `false`. By default, the plugin is enabled for every data point but only
		 * on the y-axis, unless a lower-level configuration specifies otherwise.
		 */
		dragData?: PluginConfiguration<TType> | boolean;
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
		 * @see PluginConfiguration
		 */
		dragData?: DataPointDraggingConfiguration | false;
	}
}

declare const ChartJSDragDataPlugin: Plugin;

export default ChartJSDragDataPlugin;
