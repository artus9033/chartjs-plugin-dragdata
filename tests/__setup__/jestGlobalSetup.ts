import commonGlobalSetup from "./commonGlobalSetup";

// run just once, not for each jest worker
export default async function () {
	commonGlobalSetup(["unit", "integration"]);
}
