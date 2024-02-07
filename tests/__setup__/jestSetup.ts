import "@testing-library/jest-dom/jest-globals";

import "./commonSetup";

import Chart from "chart.js/auto";
import ResizeObserver from "resize-observer-polyfill";

global.Chart = Chart;

global.ResizeObserver = ResizeObserver;
