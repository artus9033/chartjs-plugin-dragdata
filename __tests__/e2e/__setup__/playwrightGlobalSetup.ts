import { showConfig } from "../../__utils__/testsConfig";

// run just once, not for each playwright worker
export default async function () {
	await import("../../__setup__/setup");

	showConfig();
}
