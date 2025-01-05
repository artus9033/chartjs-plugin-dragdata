import fs from "fs";
import path from "path";
import { Signale } from "signale";

import {
	e2eTestsCoverageDirPath,
	integrationTestsCoverageDirPath,
	mergedCoverageDirPath,
	unitTestsCoverageDirPath,
} from "./utils/paths";

const signale = new Signale({
	scope: "collectCoverage.ts",
});

const mergedCoverageSourceReportsDirPath = path.join(
		mergedCoverageDirPath,
		"src",
	),
	reportsSources = [
		unitTestsCoverageDirPath,
		integrationTestsCoverageDirPath,
		e2eTestsCoverageDirPath,
	];

if (fs.existsSync(mergedCoverageDirPath)) {
	fs.rmSync(mergedCoverageDirPath, { recursive: true });
}

fs.mkdirSync(mergedCoverageSourceReportsDirPath, { recursive: true });

let counter = 0;
for (const reportDir of reportsSources) {
	const jsonReport = path.join(reportDir, "coverage-final.json"),
		testsComponent = path.basename(reportDir);

	if (fs.existsSync(jsonReport)) {
		signale.log(
			`Including coverage report for tests component: ${testsComponent}`,
		);

		fs.cpSync(
			jsonReport,
			path.join(
				mergedCoverageSourceReportsDirPath,
				`coverage-${testsComponent}.json`,
			),
		);

		counter++;
	} else {
		signale.log(
			`Not including coverage report for tests component ${testsComponent}, since directory '${reportDir}' does not exist`,
		);
	}
}

signale.log(
	`Placed ${counter} of ${reportsSources.length} coverage reports for merging in ${mergedCoverageDirPath}`,
);
