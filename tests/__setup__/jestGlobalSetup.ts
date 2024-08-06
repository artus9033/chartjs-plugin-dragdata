import commonGlobalSetup from "./commonGlobalSetup";

// run just once, not for each jest worker
// eslint-disable-next-line require-await
export default async function () {
	commonGlobalSetup(["unit", "integration"]);
}
