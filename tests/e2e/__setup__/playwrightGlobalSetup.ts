import commonGlobalSetup from "../../__setup__/commonGlobalSetup";

// run just once, not for each playwright worker
export default async function () {
	commonGlobalSetup(["e2e"]);
}
