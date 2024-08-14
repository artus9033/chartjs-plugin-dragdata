import { maxValueCustomMode } from "../../../tests/unit/__utils__/utils";
import { TestPageBundleFactory } from "../types";
import { renderPage } from "../utils";

export default (({ isE2ETest }) => [
	renderPage({
		title: "Line (linear)",
		fileName: "line-linear.html",
		isE2ETest: isE2ETest,
	}),
	renderPage({
		title: "Line (linear, custom interaction mode)",
		fileName: "line-linear-custom-interaction.html",
		isE2ETest: isE2ETest,
		customJS: `Chart.Interaction.modes.maxValueCustomMode = ${maxValueCustomMode.toString()}\n`,
		// make only the y-axis draggable in demo mode; E2E tests are not carried out for this page
		demoOnlyDraggableAxis: "y",
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
