# Demos for chartjs-plugin-dragdata.js

This directory contains scripts & templates for the demos that present the possible configurations and examples of the plugin. They are served alongside the [docs](TODO) for users and are used for testing.

Each demo exposes various global variables (see [/tests/typings.d.ts](/tests/typings.d.ts)) that are used by Playwright to perform end-to-end testing on the demos:

- `testedChart`: This is the instance of the Chart that is currently being tested in the demo page.

- `isTestReady`: This is a `boolean` flag that indicates whether the test setup is complete and the test is ready to be run. If `isTestReady` is `true`, the test can be run. If it is undefined or false, the test setup is not yet complete.

- `setupTest`: This is a function that is used to set up the test environment. It takes an object of type `TestChartSetupOptions` as an argument, which can include the following properties:

- `isTest`: A `boolean` that indicates whether the current environment is a test environment.

- `disablePlugin`: An optional `boolean` that, if `true`, disables the dragData plugin for the test.

- `draggableAxis`: An AxisSpec object that specifies which axes of the chart should be draggable.

- `magnetImplSerialized`: An optional `string` that represents a serialized implementation of the magnet function. This function is used to adjust the data point's value after it has been dragged.

- `roundingPrecision`: An optional `number` that specifies the number of decimal places to which values should be rounded after they have been adjusted by the magnet function.

- `resetData`: a function that resets the data to the original shape passed in to `setupTest()`; invoked in-between groups of test steps

The key files in this module are located in the `src` directory, as follows:

- `templates/layout.html.ejs` - an [EJS](https://ejs.co/) template that is core for each of the demos
- `pages/<name>.page.ts` - each of the demos themselves, using the aforementioned EJS template as its core & specifying bundles, e.g. for `line.page.ts` it specifies 2 bundles: one for a linear chart & one for a categorical X axis chart; **IMPORTANT:** each of these files **must** have a corresponding entry in `TestScenarios` inside [tests/\_\_data\_\_/data.ts](/tests/__data__/data.ts))
- `bundle.ts` - exposes a function to process all bundles exported from all `pages/*.page.ts` files; also works as an entrypoint if executed directly to run bundling just once
- `watch.ts` - entrypoint for a dev script that watches all [assets (/dist)](/dist), [demos (demos/src)](/demos/src/) and [tests/\_\_data\_\_/data.ts](/tests/__data__/data.ts)) for changes & runs the bundler function exported from `bundle.ts`

All bundle outputs along with assets copied from [/dist](/dist) (the compiled dragdata plugin) & `node_modules` (chart.js, lodash for testing code inside them) will be placed in `/demos/dist`.
