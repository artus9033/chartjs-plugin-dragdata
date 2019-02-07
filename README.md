# chartjs-plugin-dragData.js

A plugin for Chart.js >= 2.4.0

Makes data points draggable. Supports touch events.

![Drag Data Animation](https://chrispahm.github.io/chartjs-plugin-dragData/assets/chartjs-plugin-dragData.gif)

[Online demo single Y-Axis](https://chrispahm.github.io/chartjs-plugin-dragData/), [dual Y-Axis](https://chrispahm.github.io/chartjs-plugin-dragData/dualAxis.html),[small chart](https://chrispahm.github.io/chartjs-plugin-dragData/smallChart.html),[bubble chart](https://chrispahm.github.io/chartjs-plugin-dragData/bubble.html),[radar chart](https://chrispahm.github.io/chartjs-plugin-dragData/radar.html)

## Installation

### npm

```
npm install chartjs-plugin-dragdata --save
```

### CDN
In browsers, you may use the following script tag:
```
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-dragdata@0.3.0/dist/chartjs-plugin-dragData.min.js"></script>
```

Or, download a release archive file from the dist folder.

## Configuration

To make (line, bubble and radar chart) data points draggable, simply add ```dragData: true``` to the config section of the chart instance. If you (additionally to the y-axis) would like to drag data along the x-axis, you may also add ```dragX: true```.

To round the values dragged to, simply add ```dragDataRound: 0``` to the config section of the chart instance.
 * `0` will round to `..., -2, -1, 0, 1, 2, ...`
 * `1` will round to `..., -0.2, -0.1, 0.0, 0.1, 0.2, ...`
 * `-1` will round to `..., -20, -10, 0, 10, 20, ...`

Individual event listeners can be specified as follows:

```javascript
{
  ...
  dragData: true,
  dragX: false,
  dragDataRound: 0,
  onDragStart: function (event, element) {},
  onDrag: function (event, datasetIndex, index, value) {},
  onDragEnd: function (event, datasetIndex, index, value) {}
}
```

Minimum and maximum allowed data values can be specified through the `min` and `max` ticks settings in the scales options. By setting these values accordingly, unexptected (fast) changes to the scales, that may occur when dragging data points towards the outer boundaries of the y-axis, can be prohibited.

```javascript
options: {
  scales: {
    yAxes: [{
      ticks: {
        max: 25,
        min: 0
      }
    }]
  },
  ...
```

To avoid dragging specific datasets, you can set dragData to false within the dataset options.

```javascript
const data = {
  datasets: [
    {
      label: "Data Label",
      fill: false,
      data: dataPoints,
      yAxisID: 'B',
      dragData: false
    }, {
  ...
```

To avoid dragging specific scales, you can set dragData to false within the axis scale options.

```javascript
options: {
  scales: {
    yAxes: [{
      ticks: {
        max: 25,
        min: 0
      },
      dragData: false
    }]
  },
  ...
```

To avoid dragging specific data points inside a draggable dataset, you can return `false` to function `onDragStart`.

To disable the automatic update of the data, you can return `false` to function `onDrag`. Nothing will happen to the points without you changing the `data` attribute somewhere else. This is use full for frameworks like emberjs who us the data down action up paradigm.

## Gotchas
When working with a module bundler (e.g. Webpack) and a framework (e.g. Vue.js/React/Angular), you still need to import the plugin library after installing. 
Here's a small example for a Vue.js component

```js
<template>
  <div>
    <canvas id="chart"></canvas>
  </div>
</template>
<script>
import Chart from 'chart.js'
// load the options file externally for better readability of the component.
// In the chartOptions object, make sure to add "dragData: true" etc.
import chartOptions from '~/assets/js/labour.js'
import 'chartjs-plugin-dragdata'

export default {
  data() {
    return {
      chartOptions
    }
  },
  mounted() {
    this.createChart('chart', this.chartOptions)
  },
  methods: {
    createChart(chartId, chartData) {
      const ctx = document.getElementById(chartId)
      const myChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      })
    }
  }
}
</script>
<style>
</style>
```
## Contributing

Please feel free to submit an issue or a pull request!

## License

chartjs-plugin-dragdata.js is available under the [MIT license](http://opensource.org/licenses/MIT).
