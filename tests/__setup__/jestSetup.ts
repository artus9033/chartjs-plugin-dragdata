import "@testing-library/jest-dom/jest-globals";

import "./commonSetup";

import Chart from "chart.js/auto";
import * as matchers from "jest-extended";
import ResizeObserver from "resize-observer-polyfill";

expect.extend(matchers);

global.Chart = Chart;

global.ResizeObserver = ResizeObserver;
