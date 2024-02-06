import path from "path";

process.env["NODE_CONFIG_DIR"] = path.join(
	path.dirname(__filename),
	"..",
	"tests",
	"__config__",
);
