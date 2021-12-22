const { chromium } = require('playwright');

module.exports = async function run(fileName,settings) {
  const {datasetIndex,index} = settings.pointToDrag;
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });  // Or 'firefox' or 'webkit'.
  const page = await browser.newPage();
  await page.goto(`file://${__dirname}/../docs/${fileName}.html`);
  const padding = await page.evaluate(() => {
    const {left,top} = window.test.canvas.getBoundingClientRect()
    return [left,top]
  },settings.pointToDrag)
  
  // we solely drag the first datapoint in a chart
  let firstPointLocation = await page.evaluate(pointToDrag => {
    const {x,y} = window.test.getDatasetMeta(pointToDrag.datasetIndex).data[pointToDrag.index]
    return [x,y]
  },settings.pointToDrag)
  
  // and drag it to the value of the second data point
  // thefore we get the position of the second point
  let secondPointLocation = await page.evaluate(pointToDrag => {
    const {x,y} = window.test.getDatasetMeta(pointToDrag.datasetIndex).data[pointToDrag.index + 1]
    return [x,y]
  },settings.pointToDrag)
  
  // add padding to points
  firstPointLocation = [firstPointLocation[0] + padding[0], firstPointLocation[1] + padding[1]]
  secondPointLocation = [secondPointLocation[0] + padding[0], secondPointLocation[1] + padding[1]]
  
  // perform the dragging gesture
  await page.mouse.move(...firstPointLocation);
  await page.mouse.down();
  await page.mouse.move(...settings.dragToPosition(firstPointLocation,secondPointLocation));
  await page.mouse.up();
  
  // check if the values match after dragging
  const updatedLocations = await page.evaluate(pointToDrag => {
    const firstPointLocation = {
      x: window.test.getDatasetMeta(pointToDrag.datasetIndex).data[pointToDrag.index].x,
      y: window.test.getDatasetMeta(pointToDrag.datasetIndex).data[pointToDrag.index].y,
    }
    const secondPointLocation = {
      x: window.test.getDatasetMeta(pointToDrag.datasetIndex).data[pointToDrag.index + 1].x,
      y: window.test.getDatasetMeta(pointToDrag.datasetIndex).data[pointToDrag.index + 1].y,
    }
    return [firstPointLocation,secondPointLocation]
  },settings.pointToDrag)
  
  settings.checkEquality(updatedLocations[0],updatedLocations[1],fileName)  
  await page.waitForTimeout(1000)
  await browser.close();
}