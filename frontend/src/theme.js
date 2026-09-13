/*
 * theme.js
 * --------
 * The "Purple Raindrops" colour palette, defined once for the charts.
 *
 * The CSS file defines the same colours as CSS variables for normal HTML
 * elements, but Recharts draws SVG and needs the colour values in JavaScript,
 * so they live here too. Change a colour in both places to keep them in sync.
 *
 * The palette runs from magenta, through purple and violet, to cyan-blue:
 *   #F72585 -> #B5179E -> #7209B7 -> #560BAD -> #480CA8 -> #3A0CA3 -> #4361EE -> #4CC9F0
 */

export const PALETTE = {
  magenta: "#F72585",
  pinkPurple: "#B5179E",
  purple: "#7209B7",
  deepPurple: "#560BAD",
  violet: "#480CA8",
  primary: "#3A0CA3", // the main brand colour
  blue: "#4361EE",
  cyan: "#4CC9F0",
};

/* The most important data series (sales trend, feature importance, ...). */
export const SERIES_MAIN = PALETTE.primary;

/* The winning / highlighted result (best model bar, best prediction). */
export const SERIES_HIGHLIGHT = PALETTE.cyan;

/* Bars that are only there for comparison, so they should stay quiet. */
export const SERIES_MUTED = "#B9BFD6";

/* A second series drawn next to the main one (e.g. MAE next to RMSE). */
export const SERIES_SECONDARY = PALETTE.blue;

/* Categories (Sales by product line): shades of purple, dark to light. */
export const CATEGORY_SHADES = [
  "#3A0CA3",
  "#480CA8",
  "#560BAD",
  "#7209B7",
  "#8E3BC7",
  "#A96AD6",
  "#C49BE4",
];

/* Regions (Sales by country): a purple -> blue progression, dark to light. */
export const REGION_SHADES = [
  "#3A0CA3",
  "#3F1FB5",
  "#4332C7",
  "#4361EE",
  "#4A7AF0",
  "#5193F1",
  "#57ABF1",
  "#4CC9F0",
  "#7AD6F3",
  "#A8E3F7",
];

/* Neutral chart furniture: grid lines, axis lines, hover cursor, tick text. */
export const GRID = "#E9EAF3";
export const AXIS = "#DDDFEC";
export const CURSOR = "#F1F1F8";
export const TICK = "#6B7280";

/* The dashed "perfect prediction" diagonal on the actual-vs-predicted chart. */
export const REFERENCE_LINE = PALETTE.magenta;
