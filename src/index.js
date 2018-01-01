import Chart from 'chart.js'
import { drag } from 'd3-drag'
import { select, event } from 'd3-selection'

let element

function getElement (chartInstance, callback) {
	return () => {
		if (event) {
			const e = event.sourceEvent
			element = chartInstance.getElementAtEvent(e)[0]
			if (typeof callback === 'function' && element) callback(e)
		}
	}
}

function updateData (chartInstance, callback) {
	return () => {
		if (element && event) {
			const e = event.sourceEvent
			const datasetIndex = element['_datasetIndex']
			const index = element['_index']
			const value = chartInstance.scales['y-axis-0'].getValueForPixel(e.clientY)
			chartInstance.data.datasets[datasetIndex].data[index] = value
			chartInstance.update(0)
			if (typeof callback === 'function') callback(e,datasetIndex,index,value)
		}
	}
}

function dragEndCallback (chartInstance, callback) {
	return () => {
		if (typeof callback === 'function' && element) {
			const e = event.sourceEvent
			const datasetIndex = element['_datasetIndex']
			const index = element['_index']
			const value = chartInstance.data.datasets[datasetIndex].data[index]
			return callback(e,datasetIndex,index,value)
		}
	}
}
const ChartJSdragDataPlugin = {
	afterInit: function(chartInstance) {
		if (chartInstance.options.dragData) {
			select(chartInstance.chart.canvas).call(
				drag().container(chartInstance.chart.canvas)
					.on('start', getElement(chartInstance, chartInstance.options.onDragStart))
					.on('drag', updateData(chartInstance, chartInstance.options.onDrag))
					.on('end', dragEndCallback(chartInstance,chartInstance.options.onDragEnd))
			)
		}
	}
}

Chart.pluginService.register(ChartJSdragDataPlugin)

export default ChartJSdragDataPlugin
