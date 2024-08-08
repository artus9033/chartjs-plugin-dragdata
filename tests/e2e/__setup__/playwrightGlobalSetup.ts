import commonGlobalSetup from "../../__setup__/commonGlobalSetup";

// run just once, not for each playwright worker
// eslint-disable-next-line require-await
export default async function () {
	commonGlobalSetup(["e2e"]);
}
