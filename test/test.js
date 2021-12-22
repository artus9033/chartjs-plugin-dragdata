const run = require('./run.js');
const Settings = require('./Test-Defaults');

(async () => {  
  // standard line chart example
  const indexTestSettings = new Settings()
  await run('index',indexTestSettings)
  // bar chart
  await run('bar',indexTestSettings)
  // dual axis
  // use second dataset instead
  const dualAxisSettings = new Settings()
  dualAxisSettings.pointToDrag.datasetIndex = 1
  dualAxisSettings.pointToDrag.index = 3
  await run('dualAxis',dualAxisSettings)
  // small chart
  dualAxisSettings.pointToDrag.index = 1
  await run('smallChart',dualAxisSettings)
  
})();