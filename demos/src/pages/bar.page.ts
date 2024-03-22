import { TestPageBundle } from "../types";
import { renderPage } from "../utils";

export default [
	renderPage({
		title: "Bar",
		fileName: "bar.html",
	}),
	renderPage({
		title: "Horizontal Bar",
		fileName: "bar-horizontal.html",
	}),
	renderPage({
		title: "Floating Bar",
		fileName: "bar-floating.html",
	}),
	renderPage({
		title: "Horizontal Floating Bar",
		fileName: "bar-floating-horizontal.html",
	}),
	renderPage({
		title: "Stacked Bar",
		fileName: "bar-stacked.html",
	}),
	renderPage({
		title: "Horizontal Stacked Bar",
		fileName: "bar-stacked-horizontal.html",
	}),
] as TestPageBundle;
