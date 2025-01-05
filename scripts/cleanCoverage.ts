import fs from "fs";
import { Signale } from "signale";

import { coverageReportsDirPath } from "./utils/paths";

const signale = new Signale({
	scope: "cleanCoverage",
});

if (fs.existsSync(coverageReportsDirPath)) {
	signale.log(`Removing coverage reports directory: ${coverageReportsDirPath}`);

	fs.rmSync(coverageReportsDirPath, { recursive: true });
}
