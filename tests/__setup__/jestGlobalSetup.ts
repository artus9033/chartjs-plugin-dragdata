import * as matchers from "jest-extended";

import commonGlobalSetup from "./commonGlobalSetup";
expect.extend(matchers);

// run just once, not for each jest worker
// eslint-disable-next-line require-await
export default async function () {
	commonGlobalSetup(["unit", "integration"]);
}
