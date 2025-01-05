import fs from "fs";

import { Signale } from "signale";

const signale = new Signale({
	scope: "cleanCoverage",
});

import { coverageReportsDirPath } from "./utils/paths";

if (fs.existsSync(coverageReportsDirPath)) {
	signale.log(`Removing coverage reports directory: ${coverageReportsDirPath}`);

	fs.rmSync(coverageReportsDirPath, { recursive: true });
}
