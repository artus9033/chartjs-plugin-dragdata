import { TestPageBundleFactory } from "../types";
import { renderPage } from "../utils";

export default (({ isE2ETest }) => [
	renderPage({
		title: "Bar",
		fileName: "bar.html",
		isE2ETest: isE2ETest,
	}),
	renderPage({
		title: "Horizontal Bar",
		fileName: "bar-horizontal.html",
		isE2ETest: isE2ETest,
	}),
	renderPage({
		title: "Floating Bar",
		fileName: "bar-floating.html",
		isE2ETest: isE2ETest,
	}),
	renderPage({
		title: "Horizontal Floating Bar",
		fileName: "bar-floating-horizontal.html",
		isE2ETest: isE2ETest,
	}),
	renderPage({
		title: "Stacked Bar",
		fileName: "bar-stacked.html",
		isE2ETest: isE2ETest,
	}),
	renderPage({
		title: "Horizontal Stacked Bar",
		fileName: "bar-stacked-horizontal.html",
		isE2ETest: isE2ETest,
	}),
]) as TestPageBundleFactory;
