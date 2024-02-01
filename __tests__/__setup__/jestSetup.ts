import "@testing-library/jest-dom/jest-globals";

import ResizeObserver from "resize-observer-polyfill";

import { expect } from "@jest/globals";

global.ResizeObserver = ResizeObserver;
