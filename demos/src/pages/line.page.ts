import { TestPageBundle } from "../types";
import { renderPage } from "../utils";

export default [
	renderPage({
		title: "Line (linear)",
		fileName: "line-linear.html",
	}),
	renderPage({
		title: "Line (categorical)",
		fileName: "line-categorical.html",
	}),
] as TestPageBundle;
