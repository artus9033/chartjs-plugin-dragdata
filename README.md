# chartjs-plugin-dragdata.js

[![codecov](https://codecov.io/gh/artus9033/chartjs-plugin-dragdata/graph/badge.svg?token=TDRWG9LKG4)](https://codecov.io/gh/artus9033/chartjs-plugin-dragdata)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/artus9033/chartjs-plugin-dragdata/ci.yml)](https://github.com/artus9033/chartjs-plugin-dragdata/actions/workflows/ci.yml)
[![release](https://img.shields.io/github/v/release/artus9033/chartjs-plugin-dragdata?include_prereleases)](https://github.com/artus9033/chartjs-plugin-dragdata/releases)
[![npm (latest)](https://img.shields.io/npm/v/chartjs-plugin-zoom/latest)](https://www.npmjs.com/package/chartjs-plugin-zoom/v/latest)
[![npm (next)](https://img.shields.io/npm/v/chartjs-plugin-zoom/next)](https://www.npmjs.com/package/chartjs-plugin-zoom/v/next)
<a href="https://github.com/chartjs/awesome"><img src="https://awesome.re/badge-flat2.svg" alt="Awesome"></a>

**Now compatible with Chart.js v4 🎉**  
**Looking for a version compatible to Chart.js < 2.9.x? Then visit the [v2 branch](https://github.com/artus9033/chartjs-plugin-dragdata/tree/v2)!**

A plugin for Chart.js
Makes data points draggable. Supports touch events.

![Drag Data Animation](https://user-images.githubusercontent.com/20703207/77322131-8a47f800-6d13-11ea-9ca8-b9fc7f820e85.gif)

### Version compatibility with Chart.js

| Chart.js version | chartjs-plugin-dragdata version |
| :--------------: | :-----------------------------: |
|       4.x        |               2.x               |
|       3.x        |               2.x               |
|  2.4.x ~ 2.9.4   |               1.x               |

### Online demos

| Chart Type                                                                                                                     | Demo                                                                                     | Source                                                                                                                      |
| :----------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| Bar - simple bar                                                                                                               | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bar.html)                     | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/bar.html)                    |
| Horizontal Bar - simple horizontal Bar                                                                                         | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bar-horizontal.html)          | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/bar-horizontal.html)         |
| Floating bar - simple floating bars                                                                                            | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bar-floating.html)            | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/bar-floating.html)           |
| Floating bar - simple floating bars, horizontal                                                                                | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bar-floating-horizontal.html) | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/bar-stacked-horizontal.html) |
| Stacked Bar - simple stacked bar                                                                                               | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bar-stacked.html)             | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/bar-stacked.html)            |
| Stacked Horizontal Bar - simple stacked horizontal bar                                                                         | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bar-stacked-horizontal.html)  | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/bar-stacked-horizontal.html) |
| Stacked Bar - GANTT chart                                                                                                      | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/gantt.html)                   | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/ganttChart.html)             |
| Bubble - simple bubble                                                                                                         | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bubble.html)                  | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/bubble.html)                 |
| Bubble - draggable x-axis                                                                                                      | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bubble-x-only.html)           | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/bubble-x-only.html)          |
| Line - simple, single y-axis                                                                                                   | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/line-linear.html)             | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/line.html)                   |
| Line - dual y-axis                                                                                                             | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/line-dual-y-axis.html)        | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/dualAxis.html)               |
| Line - single y-axis, categorical x-axis                                                                                       | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/line-categorical.html)        | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/dualAxis.html)               |
| Line - drag multiple points                                                                                                    | [demo](https://jsfiddle.net/45nurh9L/3/)                                                 | [source](https://jsfiddle.net/45nurh9L/3/)                                                                                  |
| Line - react fiddle                                                                                                            | [demo](https://jsfiddle.net/16kvxd4u/3/)                                                 | [source](https://jsfiddle.net/16kvxd4u/3/)                                                                                  |
| Line - drag x-, and y-axis (scatter chart)                                                                                     | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/scatter.html)                 | [source](https://artus9033.github.io/chartjs-plugin-dragdata/scatter.html)                                                  |
| Line - drag dates (x and y axis)                                                                                               | [demo](https://jsfiddle.net/f72kz348/9/)                                                 | [source](https://jsfiddle.net/f72kz348/9/)                                                                                  |
| Line - zoom, pan, and drag data points (combination with [chartjs-plugin-zoom](https://github.com/chartjs/chartjs-plugin-zoom) | [demo](https://jsfiddle.net/s6xn3q9f/1/)                                                 | [source](https://jsfiddle.net/s6xn3q9f/1/)                                                                                  |
| Mixed - bar, bubble, and line chart                                                                                            | [demo](https://jsfiddle.net/rqbcs6ep/3/)                                                 | [source](https://jsfiddle.net/rqbcs6ep/3/)                                                                                  |
| Radar - simple radar                                                                                                           | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/radar.html)                   | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/radar.html)                  |
| Polar - simple polar area chart                                                                                                | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/polar.html)                   | [source](https://raw.githubusercontent.com/artus9033/chartjs-plugin-dragdata/master/demos/dist/polar.html)                  |

Click here to learn [how to use this plugin in an Observable notebook](https://observablehq.com/@chrispahm/draggable-data-charts).

## Installation

### npm

```
npm install chartjs-plugin-dragdata
```

### CDN

In browsers, you may use the following script tag:

```
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-dragdata@2.2.3/dist/chartjs-plugin-dragdata.min.js"></script>
```

Or, download a release archive file from the dist folder.

## Configuration

The following Chart.js sample configuration displays (_most_) of the available
configuration options of the `dragdata` plugin.

```js
const draggableChart = new Chart(ctx, {
	type: "line",
	data: {
		labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
		datasets: [
			{
				label: "# of Votes",
				data: [12, 19, 3, 5, 2, 3],
				fill: true,
				tension: 0.4,
				borderWidth: 1,
				pointHitRadius: 25, // for improved touch support
				// dragData: false // prohibit dragging this dataset
				// same as returning `false` in the onDragStart callback
				// for this datsets index position
			},
		],
	},
	options: {
		plugins: {
			dragData: {
				round: 1, // rounds the values to n decimal places
				// in this case 1, e.g 0.1234 => 0.1)
				showTooltip: true, // show the tooltip while dragging [default = true]
				// dragX: true // also enable dragging along the x-axis.
				// this solely works for continous, numerical x-axis scales (no categories or dates)!
				onDragStart: function (e, element) {
					/*
          // e = event, element = datapoint that was dragged
          // you may use this callback to prohibit dragging certain datapoints
          // by returning false in this callback
          if (element.datasetIndex === 0 && element.index === 0) {
            // this would prohibit dragging the first datapoint in the first
            // dataset entirely
            return false
          }
          */
				},
				onDrag: function (e, datasetIndex, index, value) {
					/*     
          // you may control the range in which datapoints are allowed to be
          // dragged by returning `false` in this callback
          if (value < 0) return false // this only allows positive values
          if (datasetIndex === 0 && index === 0 && value > 20) return false 
          */
				},
				onDragEnd: function (e, datasetIndex, index, value) {
					// you may use this callback to store the final datapoint value
					// (after dragging) in a database, or update other UI elements that
					// dependent on it
				},
			},
		},
		scales: {
			y: {
				// dragData: false // disables datapoint dragging for the entire axis
			},
		},
	},
});
```

Minimum and maximum allowed data values can also be specified through the `min` and `max` ticks settings in the scales options. By setting these values accordingly, unexpected (fast) changes to the scales, that may occur when dragging data points towards the outer boundaries of the y-axis, can be prohibited.

```javascript
const myChartOptions = {
  type: 'line', // or radar, bar, horizontalBar, bubble
  data: {...},
  options: {
    plugins: {dragData: true},
    scales: {
      y: {
        max: 25,
        min: 0
      }
    }
  }
}
```

### Applying a 'magnet'

In some scenarios, one might want to stop dragging at the closest (rounded) value, or even at a fixed value.
This may be achieved by specifying a `magnet` callback function
in the plugins settings:

```javascript
const myChartOptions = {
  type: 'line', // or radar, bar, bubble
  data: {...},
  options: {
    plugins: {
      dragData: {
        magnet: {
    		    to: Math.round // to: (value) => value + 5
        }
      }
    }
  }
}
```

## Touch devices

In order to support touch events, the [`pointHitRadius`](https://www.chartjs.org/demos/dist/latest/charts/line.html#point-styling) option should be set to a value greater than `25`. You can find working example configurations in the `demos/dist/*.html` files. Also note, that mobile devices (and thus touch events) can be simulated with the [device mode in the Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/device-mode/).

## Gotchas

When working with a module bundler (e.g. Rollup/Webpack) and a framework (e.g. Vue.js/React/Angular), you still need to import the plugin library after installing.
Here's a small example for a Vue.js component

```js
<template>
  <div>
    <canvas id="chart"></canvas>
  </div>
</template>
<script>
import { Chart, registerables } from 'chart.js'
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
    Chart.register(...registerables)
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
If you make changes to the src/index.js file, don't forget to `npm run build` and
manually test your changes against all demos in the demos/dist folder.

## License

chartjs-plugin-dragdata.js is available under the [MIT license](http://opensource.org/licenses/MIT).
