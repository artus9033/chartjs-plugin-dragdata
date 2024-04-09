import fs from "fs";

import { coverageReportsDirPath } from "./utils/paths";

if (fs.existsSync(coverageReportsDirPath)) {
	console.log(
		`[cleanCoverage.ts] Removing coverage reports directory: ${coverageReportsDirPath}`,
	);

	fs.rmSync(coverageReportsDirPath, { recursive: true });
}
