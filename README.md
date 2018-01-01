# chartjs-plugin-dragData.js

A plugin for Chart.js >= 2.4.0

Makes data points draggable.

![Drag Data Animation](https://chrispahm.github.io/chartjs-plugin-dragData/assets/chartjs-plugin-dragData.gif)

[Online demo](https://chrispahm.github.io/chartjs-plugin-dragData/).
## Configuration

To make (line chart) data points draggable, simply add ```dragData: true``` to the config section of the chart instance.
Additionally, individual event listeners can be specified as follows:

```javascript
{
	...
	dragData: true,
	onDragStart: function (event, element) {

	},
	onDrag: function (event, datasetIndex, index, value) {

	},
	onDragEnd: function (event, datasetIndex, index, value) {

	}
}
```

## Installation

To install via npm:

```
npm install chartjs-plugin-dragData --save
```

Or, download a release archive file from the dist folder.

## Contributing

Please feel free to submit an issue or a pull request!

## License

chartjs-plugin-dragdata.js is available under the [MIT license](http://opensource.org/licenses/MIT).
