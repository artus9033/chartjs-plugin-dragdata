import path from "path";

const coverageReportsDirPath = path.resolve(
	path.dirname(__filename),
	"..",
	"..",
	"coverage",
);

const unitTestsCoverageDirPath = path.join(coverageReportsDirPath, "unit");

const integrationTestsCoverageDirPath = path.join(
	coverageReportsDirPath,
	"integration",
);

const e2eTestsCoverageDirPath = path.join(coverageReportsDirPath, "e2e");

const mergedCoverageDirPath = path.join(coverageReportsDirPath, "merged");

export {
	coverageReportsDirPath,
	unitTestsCoverageDirPath,
	integrationTestsCoverageDirPath,
	e2eTestsCoverageDirPath,
	mergedCoverageDirPath,
};
