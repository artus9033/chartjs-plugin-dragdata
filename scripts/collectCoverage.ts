import fs from "fs";
import path from "path";
import { Signale } from "signale";

import {
	mergedCoverageDirPath,
	mergedCoverageSourceReportsDirPath,
	reportsSources,
} from "./utils/paths";

const signale = new Signale({
	scope: "collectCoverage.ts",
});

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

		// FIXME: remove this fix as the root cause is eliminated; tracked in https://github.com/rollup/plugins/issues/1779
		// below: fix for jest coverage output having wrong paths, skipping the root project's directory name
		const jsonContents = fs.readFileSync(jsonReport, "utf-8");

		const rootProjectDirPath = path.resolve(__dirname, ".."),
			rootProjectDirName = path.basename(rootProjectDirPath);

		// replace the root project's directory name with the tests component's name
		const fixedJsonContents = jsonContents.replace(
			new RegExp(
				`${path.dirname(rootProjectDirPath)}(?!${rootProjectDirName})`,
				"g",
			),
			rootProjectDirPath,
		);

		fs.writeFileSync(
			path.join(
				mergedCoverageSourceReportsDirPath,
				`coverage-${testsComponent}.json`,
			),
			fixedJsonContents,
		);

		// below: 'normal' logic without the above fix
		// fs.cpSync(
		// 	jsonReport,
		// 	path.join(
		// 		mergedCoverageSourceReportsDirPath,
		// 		`coverage-${testsComponent}.json`,
		// 	),
		// );

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
