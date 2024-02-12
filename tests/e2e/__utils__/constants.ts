/** threshold for desktop projects above which percentage difference of pixels from baseline in the screenshot causes a failure; normalized range (0-1) */
export const SCREENSHOT_TESTING_MAX_PIXEL_DIFF_PERCENT_DESKTOP = 0.021;

/** threshold for mobile projects above which percentage difference of pixels from baseline in the screenshot causes a failure; normalized range (0-1) */
export const SCREENSHOT_TESTING_MAX_PIXEL_DIFF_PERCENT_MOBILE = 0.051;

/** since the bar chart does not support hit radius extension, we need to be precise
 * and as testing is not perfectly precise, we want a safety margin: we start
 * dragging from a bit lower than the edge to make sure we hit the bar */
export const BAR_SAFETY_HIT_MARGIN = 2;
