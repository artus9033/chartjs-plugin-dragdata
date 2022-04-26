module.exports = class TestSettings {
  constructor() {
    this.pointToDrag = { datasetIndex: 0, index: 0 }
    this.draggingDisabled = false
    this.dragToPosition = (firstPointLocation,secondPointLocation) => {
      // array position 0 = x, 1 = y
      return [firstPointLocation[0],secondPointLocation[1]]
    }
    this.checkEquality = (firstPointStartLocation, updatedLocations, fileName) => {
      const firstPointLocation = updatedLocations[0]
      const secondPointLocation = this.draggingDisabled ? firstPointStartLocation : updatedLocations[1]

      const diff = Math.abs( firstPointLocation.y - secondPointLocation.y );
      // allow for a 2 pixel tolerance
      if (diff > 2) {
        throw new Error(`Test for ${fileName} failed - point not at expected location! Got: ${firstPointLocation.y}, Expected: ${secondPointLocation.y}`)
      } else {
        console.log(`✓ Passed test for ${fileName} example`)
      }
    }
  }
}