import { TestPageBundleFactory } from "../types";
import { renderPage } from "../utils";

export default (({ isE2ETest }) => [
	renderPage({
		title: "Radar",
		fileName: "radar.html",
		isE2ETest: isE2ETest,
	}),
]) as TestPageBundleFactory;
