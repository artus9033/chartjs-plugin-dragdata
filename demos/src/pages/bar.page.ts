import { TestPageBundle } from "../types";
import { renderPage } from "../utils";

export default [
	renderPage({
		title: "Bar",
		fileName: "bar.html",
	}),
] as TestPageBundle;
