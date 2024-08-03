import { TestPageBundle } from "../types";
import { renderPage } from "../utils";

export default [
	renderPage({
		title: "Bubble",
		fileName: "bubble.html",
	}),
	renderPage({
		title: "Bubble (x-only)",
		fileName: "bubble-x-only.html",
	}),
] as TestPageBundle;
