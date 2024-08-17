import type { Chart, ChartType, RadialLinearScale } from "chart.js";
import { getRelativePosition } from "chart.js/helpers";

import ChartJSDragDataPlugin from "../../plugin";
import {
	DragDataEvent,
	DragDataState,
	OptionalPluginConfiguration,
} from "../../types";
import { roundValue } from "../roundValue";
import { clipValue } from "./clipValue";

export function calcRadialLinear<TType extends ChartType>(
	event: DragDataEvent,
	chartInstance: Chart<TType>,
	curIndex: number,
	rAxisID: string,
	state: DragDataState | undefined = ChartJSDragDataPlugin.statesStore.get(
		chartInstance.id,
	),
) {
	let { x: cursorX, y: cursorY } = getRelativePosition(
		event,
		chartInstance as any,
	);
	const rScale = chartInstance.scales[rAxisID] as RadialLinearScale;
	let { angle: axisAngleRad } = rScale.getPointPositionForValue(
		// the radar chart has points draggable along primary axes that are aligned with
		// scales' lines; the polarArea chart, however, is draggable along lines placed in the center
		// between major lines, thus the +0.5 of index is added for the helper to calculate the angle
		// of this center guide line (the helper accept a continuous argument, in spite of the name "index")
		curIndex + (state?.type === "polarArea" ? 0.5 : 0),
		chartInstance.scales[rAxisID].max,
	);
	const { xCenter, yCenter } = rScale;

	// we calculate the dot product of the vector from center to cursor & the axis direction vector
	// center-to-cursor vector v
	let vx = cursorX - xCenter;
	let vy = cursorY - yCenter;
	// axis direction vector d
	let dx = Math.cos(axisAngleRad);
	let dy = Math.sin(axisAngleRad);
	// dot product of v & d
	let dotProduct = vx * dx + vy * dy;
	let d =
		// if dot product <= 0, then the point is on the opposite side of the center than the direction of the axis
		dotProduct > 0
			? // Euclidean distance between cursor & center
				Math.sqrt(
					Math.pow(cursorX - xCenter, 2) + Math.pow(cursorY - yCenter, 2),
				)
			: 0;

	// calculate the value from distance
	let v = rScale.getValueForDistanceFromCenter(d);

	// apply rounding
	v = roundValue(
		v,
		(
			chartInstance.config.options?.plugins
				?.dragData as OptionalPluginConfiguration<TType>
		)?.round,
	);

	v = clipValue(
		v,
		chartInstance.scales[rAxisID].min,
		chartInstance.scales[rAxisID].max,
	);

	return v;
}
