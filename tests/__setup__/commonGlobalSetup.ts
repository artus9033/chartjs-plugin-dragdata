import "../../scripts/setupEnv";

import { type TestsConfig, showConfig } from "../__utils__/testsConfig";

export default function globalSetup(which?: Array<keyof TestsConfig>) {
	showConfig(which);
}
