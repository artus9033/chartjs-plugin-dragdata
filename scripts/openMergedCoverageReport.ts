import path from "path";

import open from "open";
import { Signale } from "signale";

const signale = new Signale({
	scope: "openMergedCoverageReport",
});

import { mergedCoverageDirPath } from "./utils/paths";

const htmlPath = path.join(
	mergedCoverageDirPath,
	"report",
	"html",
	"index.html",
);

signale.info(`Opening coverage report: ${htmlPath}`);

void open(htmlPath);
