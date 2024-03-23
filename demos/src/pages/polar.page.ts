import { TestPageBundle } from "../types";
import { renderPage } from "../utils";

export default [
	renderPage({
		title: "Polar",
		fileName: "polar.html",
	}),
] as TestPageBundle;
