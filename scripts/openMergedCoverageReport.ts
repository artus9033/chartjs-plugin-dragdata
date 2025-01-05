import open from "open";
import path from "path";
import { Signale } from "signale";

import { mergedCoverageDirPath } from "./utils/paths";

const signale = new Signale({
	scope: "openMergedCoverageReport",
});

const htmlPath = path.join(
	mergedCoverageDirPath,
	"report",
	"html",
	"index.html",
);

signale.info(`Opening coverage report: ${htmlPath}`);

void open(htmlPath);
