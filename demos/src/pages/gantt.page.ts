import { TestPageBundle } from "../types";
import { renderPage } from "../utils";

export default [
	renderPage({
		title: "Gantt",
		fileName: "gantt.html",
	}),
] as TestPageBundle;
