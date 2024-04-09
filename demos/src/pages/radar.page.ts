import { TestPageBundle } from "../types";
import { renderPage } from "../utils";

export default [
	renderPage({
		title: "Radar",
		fileName: "radar.html",
	}),
] as TestPageBundle;
