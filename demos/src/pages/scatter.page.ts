import { TestPageBundle } from "../types";
import { renderPage } from "../utils";

export default [
	renderPage({
		title: "Scatter",
		fileName: "scatter.html",
	}),
] as TestPageBundle;
