import Chart from 'chart.js'
import { drag } from 'd3-drag'
import { select, event } from 'd3-selection'

let element, scale, scaleX

function getElement (chartInstance, callback) {
  return () => {
    if (event) {
      const e = event.sourceEvent
      element = chartInstance.getElementAtEvent(e)[0]

      if (element) {
        if (chartInstance.data.datasets[element['_datasetIndex']].dragData === false || element['_yScale'].options.dragData === false) {
          element = null;
          return;
        }

        scale = element['_yScale'].id
        scaleX = element['_xScale'].id
        if (typeof callback === 'function' && element) callback(e,element)
      }
    }
  }
}

function updateData (chartInstance, callback) {
  return () => {
    if (element && event) {
      const e = event.sourceEvent
      const datasetIndex = element['_datasetIndex']
      const index = element['_index']

      let x
      let y

      if (e.touches) {
        x = chartInstance.scales[scaleX].getValueForPixel(e.touches[0].clientX-chartInstance.canvas.getBoundingClientRect().left)
        y = chartInstance.scales[scale].getValueForPixel(e.touches[0].clientY-chartInstance.canvas.getBoundingClientRect().top)
      } else {
        x = chartInstance.scales[scaleX].getValueForPixel(e.clientX - chartInstance.canvas.getBoundingClientRect().left)
        y = chartInstance.scales[scale].getValueForPixel(e.clientY - chartInstance.canvas.getBoundingClientRect().top)
      }

      x = x > chartInstance.scales[scaleX].max ? chartInstance.scales[scaleX].max : x
      x = x < chartInstance.scales[scaleX].min ? chartInstance.scales[scaleX].min : x

      y = y > chartInstance.scales[scale].max ? chartInstance.scales[scale].max : y
      y = y < chartInstance.scales[scale].min ? chartInstance.scales[scale].min : y

      if(chartInstance.data.datasets[datasetIndex].data[index].x !== undefined && chartInstance.options.dragX) {
        chartInstance.data.datasets[datasetIndex].data[index].x = x
      }

      if(chartInstance.data.datasets[datasetIndex].data[index].y !== undefined) {
        chartInstance.data.datasets[datasetIndex].data[index].y = y
      }
      else {
        chartInstance.data.datasets[datasetIndex].data[index] = y
      }

      chartInstance.update(0)

      if (typeof callback === 'function') {
        callback(e, datasetIndex, index, chartInstance.data.datasets[datasetIndex].data[index])
      }
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
