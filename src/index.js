import { Chart } from "chart.js";
import { getRelativePosition } from "chart.js/helpers";
import { drag } from "d3-drag";
import { select } from "d3-selection";

let element,
	yAxisID,
	xAxisID,
	rAxisID,
	type,
	stacked,
	floatingBar,
	initValue,
	curDatasetIndex,
	curIndex,
	eventSettings;
let isDragging = false;

function getSafe(func) {
	try {
		return func();
	} catch (e) {
		return "";
	}
}

const getElement = (e, chartInstance, callback) => {
	element = chartInstance.getElementsAtEventForMode(
		e,
		"nearest",
		{ intersect: true },
		false,
	)[0];
	type = chartInstance.config.type;

	if (element) {
		let datasetIndex = element.datasetIndex;
		let index = element.index;
		// save element settings
		eventSettings = getSafe(
			() => chartInstance.config.options.plugins.tooltip.animation,
		);

		const dataset = chartInstance.data.datasets[datasetIndex];
		const datasetMeta = chartInstance.getDatasetMeta(datasetIndex);
		let curValue = dataset.data[index];
		// get the id of the datasets scale
		xAxisID = datasetMeta.xAxisID;
		yAxisID = datasetMeta.yAxisID;
		rAxisID = datasetMeta.rAxisID;

		// check if dragging the dataset or datapoint is prohibited
		if (
			dataset.dragData === false ||
			(chartInstance.config.options.scales[xAxisID] &&
				chartInstance.config.options.scales[xAxisID].dragData === false) ||
			(chartInstance.config.options.scales[yAxisID] &&
				chartInstance.config.options.scales[yAxisID].dragData === false) ||
			(chartInstance.config.options.scales[rAxisID] &&
				chartInstance.config.options.scales[rAxisID].rAxisID === false) ||
			dataset.data[element.index].dragData === false
		) {
			element = null;
			return;
		}

		if (type === "bar") {
			stacked = chartInstance.config.options.scales[xAxisID].stacked;

			// if a bar has a data point that is an array of length 2, it's a floating bar
			const samplePoint = chartInstance.data.datasets[0].data[0];
			floatingBar =
				samplePoint !== null &&
				Array.isArray(samplePoint) &&
				samplePoint.length == 2;

			let data = {};
			let newPos = calcPosition(e, chartInstance, datasetIndex, index, data);
			initValue = newPos - curValue;
		}

		// disable the tooltip animation
		if (
			chartInstance.config.options.plugins.dragData.showTooltip === undefined ||
			chartInstance.config.options.plugins.dragData.showTooltip
		) {
			if (!chartInstance.config.options.plugins.tooltip)
				chartInstance.config.options.plugins.tooltip = {};
			chartInstance.config.options.plugins.tooltip.animation = false;
		}

		if (typeof callback === "function" && element) {
			if (callback(e, datasetIndex, index, curValue) === false) {
				element = null;
			}
		}
	}
};

function roundValue(value, pos) {
	if (!isNaN(pos) && pos >= 0) {
		return Math.round(value * Math.pow(10, pos)) / Math.pow(10, pos);
	}
	return value;
}

function calcRadar(e, chartInstance, curIndex, rAxisID) {
	let { x: cursorX, y: cursorY } = getRelativePosition(e, chartInstance);
	const rScale = chartInstance.scales[rAxisID];
	let { angle: axisAngleRad } = rScale.getPointPositionForValue(
		// the radar chart has points draggable along primary axes that are aligned with
		// scales' lines; the polarArea chart, however, is draggable along lines placed in the center
		// between major lines, thus the +0.5 of index is added for the helper to calculate the angle
		// of this center guide line (the helper accept a continuous argument, in spite of the name "index")
		curIndex + (chartInstance.config.type === "polarArea" ? 0.5 : 0),
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

	// calculate the value, applying correction by chart scaling factor
	let v = 0;
	let scalingFactor = rScale.drawingArea / (rScale.max - rScale.min);
	if (rScale.options.reverse) {
		v = rScale.max - d / scalingFactor;
	} else {
		v = rScale.min + d / scalingFactor;
	}

	v = roundValue(v, chartInstance.config.options.plugins.dragData.round);

	v =
		v > chartInstance.scales[rAxisID].max
			? chartInstance.scales[rAxisID].max
			: v;
	v =
		v < chartInstance.scales[rAxisID].min
			? chartInstance.scales[rAxisID].min
			: v;

	return v;
}

function calcPosition(e, chartInstance, datasetIndex, index, data) {
	let x, y;
	const dataPoint = chartInstance.data.datasets[datasetIndex].data[index];

	if (e.touches) {
		x = chartInstance.scales[xAxisID].getValueForPixel(
			e.touches[0].clientX - chartInstance.canvas.getBoundingClientRect().left,
		);
		y = chartInstance.scales[yAxisID].getValueForPixel(
			e.touches[0].clientY - chartInstance.canvas.getBoundingClientRect().top,
		);
	} else {
		x = chartInstance.scales[xAxisID].getValueForPixel(
			e.clientX - chartInstance.canvas.getBoundingClientRect().left,
		);
		y = chartInstance.scales[yAxisID].getValueForPixel(
			e.clientY - chartInstance.canvas.getBoundingClientRect().top,
		);
	}

	x = roundValue(x, chartInstance.config.options.plugins.dragData.round);
	y = roundValue(y, chartInstance.config.options.plugins.dragData.round);

	x =
		x > chartInstance.scales[xAxisID].max
			? chartInstance.scales[xAxisID].max
			: x;
	x =
		x < chartInstance.scales[xAxisID].min
			? chartInstance.scales[xAxisID].min
			: x;

	y =
		y > chartInstance.scales[yAxisID].max
			? chartInstance.scales[yAxisID].max
			: y;
	y =
		y < chartInstance.scales[yAxisID].min
			? chartInstance.scales[yAxisID].min
			: y;

	if (floatingBar) {
		// x contains the new value for one end of the floating bar
		// dataPoint contains the old interval [left, right] of the floating bar
		// calculate difference between the new value and both sides
		// the side with the smallest difference from the new value was the one that was dragged
		// return an interval with new value on the dragged side and old value on the other side
		let newVal;
		// choose the right variable based on the orientation of the graph(vertical, horizontal)
		if (chartInstance.config.options.indexAxis === "y") {
			newVal = x;
		} else {
			newVal = y;
		}
		const diffFromLeft = Math.abs(newVal - dataPoint[0]);
		const diffFromRight = Math.abs(newVal - dataPoint[1]);

		if (diffFromLeft <= diffFromRight) {
			return [newVal, dataPoint[1]];
		} else {
			return [dataPoint[0], newVal];
		}
	}

	if (
		dataPoint.x !== undefined &&
		chartInstance.config.options.plugins.dragData.dragX
	) {
		dataPoint.x = x;
	}

	if (dataPoint.y !== undefined) {
		if (chartInstance.config.options.plugins.dragData.dragY !== false) {
			dataPoint.y = y;
		}
		return dataPoint;
	} else {
		if (chartInstance.config.options.indexAxis === "y") {
			if (chartInstance.config.options.plugins.dragData.dragX !== false) {
				return x;
			} else {
				return dataPoint;
			}
		} else {
			if (chartInstance.config.options.plugins.dragData.dragY !== false) {
				return y;
			} else {
				return dataPoint;
			}
		}
	}
}

const updateData = (e, chartInstance, pluginOptions, callback) => {
	if (element) {
		curDatasetIndex = element.datasetIndex;
		curIndex = element.index;

		isDragging = true;

		let dataPoint = chartInstance.data.datasets[curDatasetIndex].data[curIndex];

		if (type === "radar" || type === "polarArea") {
			dataPoint = calcRadar(e, chartInstance, curIndex, rAxisID);
		} else if (stacked) {
			let cursorPos = calcPosition(
				e,
				chartInstance,
				curDatasetIndex,
				curIndex,
				dataPoint,
			);
			dataPoint = roundValue(cursorPos - initValue, pluginOptions.round);
		} else if (floatingBar) {
			dataPoint = calcPosition(
				e,
				chartInstance,
				curDatasetIndex,
				curIndex,
				dataPoint,
			);
		} else {
			dataPoint = calcPosition(
				e,
				chartInstance,
				curDatasetIndex,
				curIndex,
				dataPoint,
			);
		}

		if (
			!callback ||
			(typeof callback === "function" &&
				callback(e, curDatasetIndex, curIndex, dataPoint) !== false)
		) {
			chartInstance.data.datasets[curDatasetIndex].data[curIndex] = dataPoint;
			chartInstance.update("none");
		}
	}
};

// Update values to the nearest values
function applyMagnet(chartInstance, i, j) {
	const pluginOptions = chartInstance.config.options.plugins.dragData;
	if (pluginOptions.magnet) {
		const magnet = pluginOptions.magnet;
		if (magnet.to && typeof magnet.to === "function") {
			let data = chartInstance.data.datasets[i].data[j];
			data = magnet.to(data);
			chartInstance.data.datasets[i].data[j] = data;
			chartInstance.update("none");
			return data;
		}
	} else {
		return chartInstance.data.datasets[i].data[j];
	}
}

const dragEndCallback = (e, chartInstance, callback) => {
	curDatasetIndex, (curIndex = undefined);
	isDragging = false;
	// re-enable the tooltip animation
	if (chartInstance.config.options.plugins.tooltip) {
		chartInstance.config.options.plugins.tooltip.animation = eventSettings;
		chartInstance.update("none");
	}

	// chartInstance.update('none')
	if (typeof callback === "function" && element) {
		const datasetIndex = element.datasetIndex;
		const index = element.index;
		let value = applyMagnet(chartInstance, datasetIndex, index);
		return callback(e, datasetIndex, index, value);
	}
};

const ChartJSdragDataPlugin = {
	id: "dragdata",
	afterInit: function (chartInstance) {
		if (
			chartInstance.config.options.plugins &&
			chartInstance.config.options.plugins.dragData
		) {
			const pluginOptions = chartInstance.config.options.plugins.dragData;
			select(chartInstance.canvas).call(
				drag()
					.container(chartInstance.canvas)
					.on("start", (e) =>
						getElement(e.sourceEvent, chartInstance, pluginOptions.onDragStart),
					)
					.on("drag", (e) =>
						updateData(
							e.sourceEvent,
							chartInstance,
							pluginOptions,
							pluginOptions.onDrag,
						),
					)
					.on("end", (e) =>
						dragEndCallback(
							e.sourceEvent,
							chartInstance,
							pluginOptions.onDragEnd,
						),
					),
			);
		}
	},
	beforeEvent: function (chart) {
		if (isDragging) {
			if (chart.tooltip) chart.tooltip.update();
			return false;
		}
	},
};

Chart.register(ChartJSdragDataPlugin);

// this export will be stripped by @rollup/plugin-replace in non-test builds
const mExportsForTesting = {
	dragEndCallback,
	updateData,
	getElement,
	applyMagnet,
	calcPosition,
	calcRadar,
	getSafe,
	roundValue,
};

// IMPORTANT: do not alter the below line or rollup will not pick it up for removal
export const exportsForTesting = mExportsForTesting;

export default ChartJSdragDataPlugin;
