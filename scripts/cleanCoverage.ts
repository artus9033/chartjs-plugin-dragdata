import fs from "fs";
import path from "path";

const coverageDirPath = path.resolve(
	path.dirname(__filename),
	"..",
	"coverage",
);

if (fs.existsSync(coverageDirPath)) {
	console.log(
		`[cleanCoverage.ts] Removing coverage directory: ${coverageDirPath}`,
	);

	fs.rmSync(coverageDirPath, { recursive: true });
}
