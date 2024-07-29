import { TestPageBundleFactory } from "../types";
import { renderPage } from "../utils";

export default (({ isE2ETest }) => [
	renderPage({
		title: "Line (linear)",
		fileName: "line-linear.html",
		isE2ETest: isE2ETest,
	}),
	renderPage({
		title: "Line (categorical)",
		fileName: "line-categorical.html",
		isE2ETest: isE2ETest,
	}),
	renderPage({
		title: "Line (dual y-axis)",
		fileName: "line-dual-y-axis.html",
		isE2ETest: isE2ETest,
	}),
]) as TestPageBundleFactory;
