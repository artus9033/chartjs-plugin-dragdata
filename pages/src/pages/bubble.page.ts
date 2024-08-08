import { TestPageBundleFactory } from "../types";
import { renderPage } from "../utils";

export default (({ isE2ETest }) => [
	renderPage({
		title: "Bubble",
		fileName: "bubble.html",
		isE2ETest: isE2ETest,
	}),
	renderPage({
		title: "Bubble (x-only)",
		fileName: "bubble-x-only.html",
		isE2ETest: isE2ETest,
	}),
]) as TestPageBundleFactory;
