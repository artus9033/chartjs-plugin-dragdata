import { Chart } from 'chart.js'
import { drag } from 'd3-drag'
import { select } from 'd3-selection'

let element, yAxisID, xAxisID, rAxisID, type, stacked, floatingBar, initValue, curDatasetIndex, curIndex, eventSettings
let isDragging = false

function getSafe(func) {
    try {
        return func()
    } catch (e) {
        return ''
    }
}

const getElement = (e, chartInstance, callback) => {
    element = chartInstance.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)[0]
    type = chartInstance.config.type

   if (element) {
        let datasetIndex = element.datasetIndex
        let index = element.index
        // save element settings
        eventSettings = getSafe(() => chartInstance.config.options.plugins.tooltip.animation)

        const dataset = chartInstance.data.datasets[datasetIndex]
        const datasetMeta = chartInstance.getDatasetMeta(datasetIndex)
        let curValue = dataset.data[index]
        // get the id of the datasets scale
        xAxisID = datasetMeta.xAxisID
        yAxisID = datasetMeta.yAxisID
        rAxisID = datasetMeta.rAxisID

        // check if dragging the dataset or datapoint is prohibited
        if (dataset.dragData === false ||
            (chartInstance.config.options.scales[xAxisID] && chartInstance.config.options.scales[xAxisID].dragData === false) ||
            (chartInstance.config.options.scales[yAxisID] && chartInstance.config.options.scales[yAxisID].dragData === false) ||
            (chartInstance.config.options.scales[rAxisID] && chartInstance.config.options.scales[rAxisID].rAxisID === false) ||
            dataset.data[element.index].dragData === false
        ) {
            element = null
            return
        }

        if (type === 'bar') {
            stacked = chartInstance.config.options.scales[xAxisID].stacked

            // if a bar has a data point that is an array of length 2, it's a floating bar
            const samplePoint = chartInstance.data.datasets[0].data[0]
            floatingBar = (samplePoint !== null) && Array.isArray(samplePoint) && samplePoint.length >= 2

            let newPos = calcPosition(e, chartInstance, datasetIndex, index)
            initValue = newPos - curValue
        }

        // disable the tooltip animation
        if (chartInstance.config.options.plugins.dragData.showTooltip === undefined || chartInstance.config.options.plugins.dragData.showTooltip) {
            if (!chartInstance.config.options.plugins.tooltip) chartInstance.config.options.plugins.tooltip = {}
            chartInstance.config.options.plugins.tooltip.animation = false
        }

        if (typeof callback === 'function' && element) {
            if (callback(e, datasetIndex, index, curValue) === false) {
                element = null
            }
        }
    }
}

function roundValue(value, pos) {
    if (!isNaN(pos)) {
        return Math.round(value * Math.pow(10, pos)) / Math.pow(10, pos)
    }
    return value
}

function calcRadar(e, chartInstance) {
    let x, y, v
    if (e.touches) {
        x = e.touches[0].clientX - chartInstance.canvas.getBoundingClientRect().left
        y = e.touches[0].clientY - chartInstance.canvas.getBoundingClientRect().top
    } else {
        x = e.clientX - chartInstance.canvas.getBoundingClientRect().left
        y = e.clientY - chartInstance.canvas.getBoundingClientRect().top
    }
    let rScale = chartInstance.scales[rAxisID]
    let d = Math.sqrt(Math.pow(x - rScale.xCenter, 2) + Math.pow(y - rScale.yCenter, 2))
    let scalingFactor = rScale.drawingArea / (rScale.max - rScale.min)
    if (rScale.options.ticks.reverse) {
        v = rScale.max - (d / scalingFactor)
    } else {
        v = rScale.min + (d / scalingFactor)
    }

    v = roundValue(v, chartInstance.config.options.plugins.dragData.round)

    v = v > chartInstance.scales[rAxisID].max ? chartInstance.scales[rAxisID].max : v
    v = v < chartInstance.scales[rAxisID].min ? chartInstance.scales[rAxisID].min : v

    return v
}

function calcPosition(e, chartInstance, datasetIndex, index) {
    let x, y

    const dataPoint = chartInstance.data.datasets[datasetIndex].data[index]

    const chartScaleX = chartInstance.scales[xAxisID]
    const chartScaleY = chartInstance.scales[yAxisID]

    x = chartScaleX.getValueForPixel((e.touches ? e.touches[0].clientX : e.clientX) - chartInstance.canvas.getBoundingClientRect().left)
    y = chartScaleY.getValueForPixel((e.touches ? e.touches[0].clientY : e.clientY) - chartInstance.canvas.getBoundingClientRect().top)

    x = roundValue(x, chartInstance.config.options.plugins.dragData.round)
    y = roundValue(y, chartInstance.config.options.plugins.dragData.round)

    x = x > chartScaleX.max ? chartScaleX.max : x
    x = x < chartScaleX.min ? chartScaleX.min : x

    y = y > chartScaleY.max ? chartScaleY.max : y
    y = y < chartScaleY.min ? chartScaleY.min : y


    if (floatingBar) {
        // x contains the new value for one end of the floating bar
        // dataPoint contains the old interval [left, right] of the floating bar
        // calculate difference between the new value and both sides
        // the side with the smallest difference from the new value was the one that was dragged
        // return an interval with new value on the dragged side and old value on the other side
		let newVal
		let minVal
        let maxVal
        // choose the right variable based on the orientation of the graph(vertical, horizontal)
        if (chartInstance.config.options.indexAxis === 'y') {
			newVal = x
            minVal = chartScaleX.min
            maxVal = chartScaleX.max
        } else {
            newVal = y
            minVal = chartScaleY.min
            maxVal = chartScaleY.max
		}

		let isDate = false;

		let dataPointLeft = dataPoint[0]
		if (typeof dataPointLeft === 'string' || dataPointLeft instanceof String) {
			dataPointLeft = new Date(dataPointLeft)
		}
		if (dataPointLeft instanceof Date) {
			isDate = true;
			dataPointLeft = dataPointLeft.getTime()
		}

		let dataPointRight = dataPoint[1] ?? dataPoint[0]
		if (typeof dataPointRight === 'string' || dataPointRight instanceof String) {
			dataPointRight = new Date(dataPointRight)
		}
		if (dataPointRight instanceof Date) {
			dataPointRight = dataPointRight.getTime()
		}

        const pointRange = dataPointRight - dataPointLeft
        const pointSideRange = pointRange ? pointRange * 0.1 : 0 // 10% of left or right handle to move sides

        if (pointRange && newVal - dataPointLeft <= pointSideRange) { // Move left side

            dataPoint[0] = isDate ? new Date(newVal) : newVal

        } else if (pointRange && dataPointRight - newVal <= pointSideRange) { // Move right side

            dataPoint[1] = isDate ? new Date(newVal) : newVal

        } else { // Move entire bar

            let leftVal = newVal - pointRange / 2;
            let rightVal = newVal + pointRange / 2;

            if (leftVal < minVal) {
                leftVal = minVal
                rightVal = leftVal + pointRange
                if (rightVal > maxVal)
                    rightVal = maxVal
            }

            if (rightVal > maxVal) {
                rightVal = maxVal
                leftVal = rightVal - pointRange
                if (leftVal < minVal)
                    leftVal = minVal
            }

            dataPoint[0] = isDate ? new Date(leftVal) : leftVal;
            dataPoint[1] = isDate ? new Date(rightVal) : rightVal;
        }

        return dataPoint
	}

    if (dataPoint.x !== undefined && chartInstance.config.options.plugins.dragData.dragX) {
        dataPoint.x = x
    }

    if (dataPoint.y !== undefined) {
        if (chartInstance.config.options.plugins.dragData.dragY !== false) {
            dataPoint.y = y
        }
        return dataPoint
    } else {
        if (chartInstance.config.options.indexAxis === 'y') {
            return x
        } else {
            return y
        }
    }
}

const updateData = (e, chartInstance, pluginOptions, callback) => {
  
    if (element) {
        curDatasetIndex = element.datasetIndex
        curIndex = element.index

        isDragging = true

        let currentData = chartInstance.data.datasets[curDatasetIndex].data
        let dataPoint = currentData[curIndex]
       
        if (type === 'radar' || type === 'polarArea') {
            dataPoint = calcRadar(e, chartInstance)
        } else if (stacked) {    
            let cursorPos = calcPosition(e, chartInstance, curDatasetIndex, curIndex)
            dataPoint = roundValue(cursorPos - initValue, pluginOptions.round)
        } else if (floatingBar) {
            //timline
            dataPoint = calcPosition(e, chartInstance, curDatasetIndex, curIndex)
        } else {
            dataPoint = calcPosition(e, chartInstance, curDatasetIndex, curIndex)
        }

        if (!callback || (typeof callback === 'function' && callback(e, curDatasetIndex, curIndex, dataPoint) !== false)) {
            currentData[curIndex] = dataPoint
			chartInstance.update('none')
		}
    }
}

// Update values to the nearest values
function applyMagnet(chartInstance, i, j) {
    const pluginOptions = chartInstance.config.options.plugins.dragData
    if (pluginOptions.magnet) {
        const magnet = pluginOptions.magnet
        if (magnet.to && typeof magnet.to === 'function') {
            let data = chartInstance.data.datasets[i].data[j]
            data = magnet.to(data)
            chartInstance.data.datasets[i].data[j] = data
            chartInstance.update('none')
            return data
        }
    } else {
        return chartInstance.data.datasets[i].data[j]
    }
}

const dragEndCallback = (e, chartInstance, callback) => {
	if (element) {
		curDatasetIndex, curIndex = undefined
		isDragging = false
		// re-enable the tooltip animation
		if (chartInstance.config.options.plugins.tooltip) {
			chartInstance.config.options.plugins.tooltip.animation = eventSettings
			chartInstance.update('none')
		}
		let currentData = chartInstance.data.datasets[curDatasetIndex].data
		let dataPoint = currentData[element.index]
		var dragDataEvent = new CustomEvent('dragdata', {
			detail: dataPoint,
			bubbles: true,
			cancelable: true,
			composed: false,
		});
		chartInstance.canvas.dispatchEvent(dragDataEvent);
		// chartInstance.update('none')
		if (typeof callback === 'function' && element) {
			const datasetIndex = element.datasetIndex
			const index = element.index
			let value = applyMagnet(chartInstance, datasetIndex, index)
			return callback(e, datasetIndex, index, value)
		}
	}
}

const ChartJSdragDataPlugin = {
    id: 'dragdata',
    afterInit: function (chartInstance) {
        if (chartInstance.config.options.plugins && chartInstance.config.options.plugins.dragData) {
            const pluginOptions = chartInstance.config.options.plugins.dragData
            select(chartInstance.canvas).call(
                drag().container(chartInstance.canvas)
                    .on('start', e => getElement(e.sourceEvent, chartInstance, pluginOptions.onDragStart))
                    .on('drag', e => updateData(e.sourceEvent, chartInstance, pluginOptions, pluginOptions.onDrag))
                    .on('end', e => dragEndCallback(e.sourceEvent, chartInstance, pluginOptions.onDragEnd))
            )
        }
    },
    afterEvent: function (chart) {
    if (!element) return    
        if (isDragging) {
            chart.tooltip.setActiveElements([element], {
                x: element.element.x,
                y: element.element.y
            })
    }
    }
}

Chart.register(ChartJSdragDataPlugin)

export default ChartJSdragDataPlugin
