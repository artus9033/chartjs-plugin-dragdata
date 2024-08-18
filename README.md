# chartjs-plugin-dragdata.js

![NPM Downloads](https://img.shields.io/npm/dm/chartjs-plugin-dragdata)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/artus9033/chartjs-plugin-dragdata/ci.yml)](https://github.com/artus9033/chartjs-plugin-dragdata/actions/workflows/ci.yml)
[![release](https://img.shields.io/github/v/release/artus9033/chartjs-plugin-dragdata?include_prereleases)](https://github.com/artus9033/chartjs-plugin-dragdata/releases)
[![npm (latest)](https://img.shields.io/npm/v/chartjs-plugin-dragdata/latest)](https://www.npmjs.com/package/chartjs-plugin-dragdata/v/latest)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/chartjs-plugin-dragdata)
![npm bundle size](https://img.shields.io/bundlephobia/min/chartjs-plugin-dragdata)
[![codecov](https://codecov.io/gh/artus9033/chartjs-plugin-dragdata/graph/badge.svg?token=TDRWG9LKG4)](https://codecov.io/gh/artus9033/chartjs-plugin-dragdata)
<a href="https://github.com/chartjs/awesome"><img src="https://awesome.re/badge-flat2.svg" alt="Awesome"></a>

A plugin for Chart.js that makes data points draggable. Supports touch events & arbitrary Chart.js [interaction modes](https://www.chartjs.org/docs/latest/samples/tooltip/interactions.html).

**Compatible with Chart.js v4, v3 & v2.4+ 🎉**

![Drag Data Animation](https://user-images.githubusercontent.com/20703207/77322131-8a47f800-6d13-11ea-9ca8-b9fc7f820e85.gif)

### Table of contents

- [chartjs-plugin-dragdata.js](#chartjs-plugin-dragdatajs)
    - [Table of contents](#table-of-contents)
    - [Chart.js version compatibility](#chartjs-version-compatibility)
    - [Online demos](#online-demos)
  - [Installation](#installation)
    - [npm](#npm)
    - [yarn](#yarn)
    - [CDN](#cdn)
  - [Getting started](#getting-started)
    - [Configuration](#configuration)
      - [Per-chart configuration](#per-chart-configuration)
      - [Per-scale configuration](#per-scale-configuration)
      - [Per-dataset configuration](#per-dataset-configuration)
      - [Per-data-point configuration](#per-data-point-configuration)
    - [Example configuration](#example-configuration)
    - [Applying a 'magnet'](#applying-a-magnet)
  - [React integration example](#react-integration-example)
  - [Touch devices](#touch-devices)
  - [Gotchas](#gotchas)
  - [Contributing](#contributing)
    - [Additional scripts](#additional-scripts)
  - [License](#license)

---

### Chart.js version compatibility

| Chart.js version | chartjs-plugin-dragdata version |                                    git branch                                     |
| :--------------: | :-----------------------------: | :-------------------------------------------------------------------------------: |
|       4.x        |               2.x               | [master branch](https://github.com/artus9033/chartjs-plugin-dragdata/tree/master) |
|       3.x        |               2.x               |     [v3 branch](https://github.com/artus9033/chartjs-plugin-dragdata/tree/v3)     |
|  2.4.x ~ 2.9.4   |               1.x               |     [v2 branch](https://github.com/artus9033/chartjs-plugin-dragdata/tree/v2)     |

### Online demos

| Chart Type                                                                                                                                                                                     | Demo                                                                                            | Source                                                             |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| Bar - simple bar                                                                                                                                                                               | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bar.html)                            | [source](pages/dist-demos/bar.html#L36)                            |
| Horizontal Bar - simple horizontal Bar                                                                                                                                                         | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bar-horizontal.html)                 | [source](pages/dist-demos/bar-horizontal.html#L36)                 |
| Floating bar - simple floating bars                                                                                                                                                            | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bar-floating.html)                   | [source](pages/dist-demos/bar-floating.html#L36)                   |
| Floating bar - simple floating bars, horizontal                                                                                                                                                | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bar-floating-horizontal.html)        | [source](pages/dist-demos/bar-floating-horizontal.html#L38)        |
| Stacked Bar - simple stacked bar                                                                                                                                                               | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bar-stacked.html)                    | [source](pages/dist-demos/bar-stacked.html#L36)                    |
| Stacked Horizontal Bar - simple stacked horizontal bar                                                                                                                                         | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bar-stacked-horizontal.html)         | [source](pages/dist-demos/bar-stacked-horizontal.html#L38)         |
| Stacked Bar - GANTT chart                                                                                                                                                                      | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/gantt.html)                          | [source](pages/dist-demos/gantt.html#L36)                          |
| Bubble - simple bubble                                                                                                                                                                         | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bubble.html)                         | [source](pages/dist-demos/bubble.html#L36)                         |
| Bubble - draggable x-axis                                                                                                                                                                      | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/bubble-x-only.html)                  | [source](pages/dist-demos/bubble-x-only.html#L36)                  |
| Line - simple, single y-axis                                                                                                                                                                   | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/line-linear.html)                    | [source](pages/dist-demos/line-linear.html#L36)                    |
| Line - dual y-axis                                                                                                                                                                             | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/line-dual-y-axis.html)               | [source](pages/dist-demos/line-dual-y-axis.html#L36)               |
| Line - single y-axis, categorical x-axis                                                                                                                                                       | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/line-categorical.html)               | [source](pages/dist-demos/line-categorical.html#L36)               |
| Line - single y-axis, [custom (max value)](pages/dist-demos/line-linear-custom-interaction.html#L39) [interaction mode](https://www.chartjs.org/docs/latest/samples/tooltip/interactions.html) | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/line-linear-custom-interaction.html) | [source](pages/dist-demos/line-linear-custom-interaction.html#L63) |
| Line - drag multiple points                                                                                                                                                                    | [demo](https://jsfiddle.net/45nurh9L/3/)                                                        | [source](https://jsfiddle.net/45nurh9L/3/)                         |
| Line - react fiddle                                                                                                                                                                            | [demo](https://jsfiddle.net/16kvxd4u/3/)                                                        | [source](https://jsfiddle.net/16kvxd4u/3/)                         |
| Line - drag x-, and y-axis (scatter chart)                                                                                                                                                     | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/scatter.html)                        | [source](pages/dist-demos/scatter.html#L36)                        |
| Line - drag dates (x and y axis)                                                                                                                                                               | [demo](https://jsfiddle.net/f72kz348/9/)                                                        | [source](https://jsfiddle.net/f72kz348/9/)                         |
| Line - zoom, pan, and drag data points (combination with [chartjs-plugin-zoom](https://github.com/chartjs/chartjs-plugin-zoom))                                                                | [demo](https://jsfiddle.net/s6xn3q9f/1/)                                                        | [source](https://jsfiddle.net/s6xn3q9f/1/)                         |
| Mixed - bar, bubble, and line chart                                                                                                                                                            | [demo](https://jsfiddle.net/rqbcs6ep/3/)                                                        | [source](https://jsfiddle.net/rqbcs6ep/3/)                         |
| Radar - simple radar                                                                                                                                                                           | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/radar.html)                          | [source](pages/dist-demos/radar.html#L36)                          |
| Polar - simple polar area chart                                                                                                                                                                | [demo](https://artus9033.github.io/chartjs-plugin-dragdata/polar.html)                          | [source](pages/dist-demos/polar.html#L36)                          |

Click here to learn [how to use this plugin in an Observable notebook](https://observablehq.com/@chrispahm/draggable-data-charts).

## Installation

### npm

```bash
npm install chartjs-plugin-dragdata
```

### yarn

```bash
yarn add chartjs-plugin-dragdata
```

### CDN

In browsers, you may simply add the following script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-dragdata@latest/dist/chartjs-plugin-dragdata.min.js"></script>
```

Or, download a release archive file from [releases](https://github.com/artus9033/chartjs-plugin-dragdata/releases).

## Getting started

After you install the plugin, it should work out-of-the-box since it features automatic global registration, i.e., automatically calls `Chart.register(ChartJSDragDataPlugin)` and is therefore applied to all charts. If you want to disable it in a specific chart, please refer to the [Configuration section below](#configuration).

> [!NOTE]
> The automatic registration behaviour is **deprecated** and is planned to be removed in the nearest major release (`v3.0.0`). After the change, it will be necessary to perform the registration manually as [described in chart.js documentation](https://www.chartjs.org/docs/latest/developers/plugins.html#using-plugins).

### Configuration

The plugin can be configured in multiple ways:

- [per-chart](#per-chart-configuration) (inside `plugins` section in chart configuration)
- [per-scale](#per-scale-configuration) (inside a scale's configuration)
- [per-dataset](#per-dataset-configuration) (inside a dataset's configuration)
- [per-data-point](#per-data-point-configuration) (inside a data point's object, for object data points only)

Applying a configuration to disable dragging at any of the above levels will cause the successive (lower on the list) levels to be overridden. For instance, disabling dragging for a dataset will cause all data points inside it to be disabled. This is to achieve compatibility with the previous versions of the library.

> [!NOTE]
> The above is about to change in the nearest major release (`v3.0.0`). After the change, the configuration of the lower levels will override the higher levels.

#### Per-chart configuration

Per-chart configuration can be applied to a single chart by adding to `chart.options.plugins` a property `dragData` of type `PluginConfiguration | boolean`.

By default, the plugin is enabled, which is equivalent to setting the property to `true`. Note that the default behaviour, however, is allowing for dragging only on the y-axis, and not on the x-axis. To enable dragging on the x-axis, you must apply other configuration options.
To disable the plugin for a chart, the property must be set to `false` (which applies just to the given chart).

```javascript
new Chart(ctx, {
  options: {
    plugins:{
      dragData: ... // PluginConfiguration goes here
    }
  }
})
```

The `PluginConfiguration` object can contain the following properties:

| Property      | Type                                                                                                                           | Default     | Description                                                                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dragX`       | `boolean`                                                                                                                      | `false`     | Enables dragging along the x-axis. This solely works for continuous, numerical x-axis scales (no categories or dates)!                                                                                                       |
| `dragY`       | `boolean`                                                                                                                      | `true`      | Enables dragging along the y-axis.                                                                                                                                                                                           |
| `onDragStart` | `DragEventCallback = (event: MouseEvent \| TouchEvent, datasetIndex: number, index: number, value: number) => boolean \| void` | `undefined` | Callback function that is called when dragging starts. If the callback returns `false`, dragging is stopped for the given data point. If the callback returns `false`, the drag is prevented and the new value is discarded. |
| `onDrag`      | `DragEventCallback = (event: MouseEvent \| TouchEvent, datasetIndex: number, index: number, value: number) => boolean \| void` | `undefined` | Callback function that is called when dragging. If the callback returns `false`, the drag is prevented and the previous value of the data point is still effective while the new one is discarded.                           |
| `onDragEnd`   | `DragEventCallback = (event: MouseEvent \| TouchEvent, datasetIndex: number, index: number, value: number) => void`            | `undefined` | Callback function that is called when dragging ends. If the callback returns `false`, the drag is prevented and the previous value of the data point is still effective while the new one is discarded.                      |
| `magnet`      | `{ to: (value: ChartDataItemType) => ChartDataItemType }`                                                                      | `undefined` | Configuration object for applying a 'magnet' to the dragged data point.                                                                                                                                                      |

#### Per-scale configuration

Per-scale configuration can be applied to a single chart's scale by adding to `chart.options.scales[scaleID]` a property `dragData` of type `boolean`. This property can be set to `true` to enable dragging for the entire scale, or to `false` to disable it.

#### Per-dataset configuration

Per-dataset configuration can be applied to a single chart's dataset by adding to `chart.data.datasets[datasetIndex]` a property `dragData` of type `boolean`. This property can be set to `true` to enable dragging for the entire dataset, or to `false` to disable it.

#### Per-data-point configuration

Per-data-point configuration can be applied to a single data point by adding to `chart.data.datasets[datasetIndex].data[index]` a property `dragData` of type `boolean`. This property can be set to `true` to enable dragging for the entire dataset, or to `false` to disable it.

### Example configuration

The following Chart.js sample configuration displays most of the available
configuration options of the `dragdata` plugin. For all of the options, see the [Configuration section](#configuration).

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
				onDragStart: function (event, datasetIndex, index, value) {
					// you may use this callback to prohibit dragging certain datapoints
					// by returning false in this callback
					if (element.datasetIndex === 0 && element.index === 0) {
						// this would prohibit dragging the first datapoint in the first
						//dataset entirely
						return false;
					}
				},
				onDrag: function (event, datasetIndex, index, value) {
					// you may control the range in which datapoints are allowed to be
					// dragged by returning `false` in this callback
					if (value < 0) return false; // this only allows positive values
					if (datasetIndex === 0 && index === 0 && value > 20) return false;
				},
				onDragEnd: function (event, datasetIndex, index, value) {
					// you may use this callback to store the final datapoint value
					// (after dragging) in a database, or update other UI elements that
					// dependent on it
				},
			},
		},
		scales: {
			y: {
				dragData: false, // disables datapoint dragging for the entire axis
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

## React integration example

You can find a full React example featuring `react-chartjs-2` in the repository: [chartjs-plugin-dragdata-react-example](https://github.com/artus9033/chartjs-plugin-dragdata-react-example).

## Touch devices

In order to support touch events, the [`pointHitRadius`](https://www.chartjs.org/demos/dist/latest/charts/line.html#point-styling) option should be set to a value greater than `25`. You can find working example configurations in the `pages/dist-demos/*.html` files. Also note, that mobile devices (and thus touch events) can be simulated with the [device mode in the Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/device-mode/).

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
  // Load the options file externally for better readability of the component.
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
```

## Contributing

Please feel free to submit an issue or a pull request!
If you make changes to the source files, don't forget to:

- `npm run build` to build the library (outputs will be written to `dist/`) or `npm run build:watch` to run the rollup packager in watch mode and build the library each time the source files change
- `npm run build:pages` or `npm run build:pages:watch` to build the demo & E2E test pages files; outputs will be written to `pages/dist-demos/` for demos, and to `/pages/dist-e2e` for E2E tests (the latter ones containing `eval`-using code for injecting data from Playwright)
- run unit, integration & E2E tests with `npm run test` (or separately with `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`)
- if your changes do change the chart's appearance after performing some interaction, update snapshots by running the command `npm run test:e2e:updateSnapshots`
- manually test your changes to ensure that they do work and don't break existing features
- when committing, please remember that the commit message must match the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) convention; lefthook will check that for you automatically
- create a PR

### Additional scripts

The build command comes in four variants:

- `build` which builds bundles for all targets:
  - `chartjs-plugin-dragdata.esm.js`- ESM production, minified (tersed) bundle
  - `chartjs-plugin-dragdata.js`- UMD production, non-minified bundle
  - `chartjs-plugin-dragdata.min.js` - UMD production, minified (tersed) bundle
  - `chartjs-plugin-dragdata-test.js` - bundle for Jest unit tests with coverage instrumentation code injected by `rollup-istanbul-plugin`
  - `chartjs-plugin-dragdata-test-browser.js` - bundle for E2E test with additional test-only exports used for automatic tests, allows for injection of urlencoded configuration for Playwright and with coverage instrumentation code injected by `rollup-istanbul-plugin`
- `build:no-coverage` which works like `build`, but does not include the `rollup-istanbul-plugin`, which may sometimes be helpful when you alter the code and encounter an error when running tests, making the result bundle not contain rubbish code injected by Istanbul
- `build:watch` which works as `build`, but watches source files for changes and triggers a rebuild whenever they change
- `build:watch:no-coverage` which works like a mix of `build:watch` and `build:no-coverage`

Scripts for linting are also provided:

- `lint` which runs ESLint on the project
- `lint:fix` which runs ESLint on the project in fix mode

## License

chartjs-plugin-dragdata.js is available under the [MIT license](http://opensource.org/licenses/MIT).
