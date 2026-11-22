"use strict";

/**
 * Detection of colors that bypass the theme without being hex/rgb()
 * literals. Shared by `rules/no-hard-coded-colors.js` (JS/TS) and
 * `css-colors.js` (CSS, `@apply`).
 *
 * Two families:
 *  - Tailwind utilities that point at a fixed color: the default palettes
 *    (`text-gray-400`, `bg-zinc-900`, `border-neutral-800/50`) and the named
 *    colors (`bg-black`, `text-white`, `from-black`, `via-black/50`),
 *    including variants (`hover:`, `md:`, `[&>svg]:`) and the `!` modifier.
 *  - CSS named colors `white`/`black` in color-bearing declarations and
 *    style objects (`color: white`, `background: black`), and the Mantine
 *    style props that take them (`c="white"`, `bg="black"`).
 *
 * The repo's own token palettes (`paper-*`, `surface-*`, `brand-*`, `line`,
 * `nav-*`, `dimmed-*`, `panel*`, `state-*`, `text-subtle`, ...) never collide
 * with this list, so they are allowed without being enumerated: a utility is
 * only reported when its color segment is exactly one of Tailwind's DEFAULT
 * palettes. A new token palette is therefore allowed automatically; the test
 * suite checks that no color key declared in
 * `packages/config-tailwind/tailwind.config.ts` shadows a default palette.
 * `transparent`, `current`/`currentColor` and `inherit` are always fine.
 */

/** Tailwind v3 default palettes (`tailwindcss/colors`, minus the deprecated aliases). */
const TAILWIND_DEFAULT_PALETTES = Object.freeze([
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
]);

/** Named colors that have no shade. */
const TAILWIND_NAMED_COLORS = Object.freeze(["black", "white"]);

/**
 * Utility prefixes that take a color. `border-t`, `ring-offset`,
 * `decoration`, ... are listed explicitly so `text-gray-400` is reported but
 * `text-legacy-gray-100` (a repo token) is not.
 */
const COLOR_UTILITY_PREFIXES = Object.freeze([
  "bg",
  "text",
  "border",
  "border-x",
  "border-y",
  "border-t",
  "border-r",
  "border-b",
  "border-l",
  "border-s",
  "border-e",
  "ring",
  "ring-offset",
  "outline",
  "fill",
  "stroke",
  "from",
  "via",
  "to",
  "shadow",
  "decoration",
  "divide",
  "placeholder",
  "caret",
  "accent",
  "drop-shadow",
]);

const PREFIX_SOURCE = COLOR_UTILITY_PREFIXES.map((prefix) =>
  prefix.replace(/-/g, "\\-"),
).join("|");
const PALETTE_SOURCE = TAILWIND_DEFAULT_PALETTES.join("|");
const NAMED_SOURCE = TAILWIND_NAMED_COLORS.join("|");

const COLOR_UTILITY = new RegExp(
  `^(?:${PREFIX_SOURCE})-(?:(?:${PALETTE_SOURCE})-\\d{2,3}|${NAMED_SOURCE})(?:/(?:\\d+(?:\\.\\d+)?|\\[[^\\]]*\\]))?$`,
);

/**
 * Splits `hover:[&>svg]:!text-white` and returns the utility part
 * (`!text-white`) by cutting at the last `:` that is outside brackets.
 */
function stripVariants(token) {
  let depth = 0;
  let cut = -1;

  for (let index = 0; index < token.length; index += 1) {
    const char = token[index];
    if (char === "[" || char === "(") depth += 1;
    else if (char === "]" || char === ")") depth -= 1;
    else if (char === ":" && depth === 0) cut = index;
  }

  return token.slice(cut + 1);
}

function isNamedTailwindColorClass(token) {
  if (token.length < 4 || token.length > 120) return false;

  const utility = stripVariants(token)
    .replace(/^[!-]+/, "")
    .replace(/!$/, "");

  return COLOR_UTILITY.test(utility);
}

/**
 * Returns every Tailwind class in `value` (a class list or any string) that
 * points at a default-palette or named color.
 */
function findNamedTailwindColorClasses(value) {
  if (typeof value !== "string" || value.length === 0) return [];

  const found = [];

  for (const token of value.split(/[\s"'`,;{}]+/)) {
    if (token && isNamedTailwindColorClass(token)) found.push(token);
  }

  return found;
}

const URL_OR_QUOTED =
  /\burl\(\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^)]*)\)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/gi;

const NAMED_CSS_COLOR = /(?<![\w-])(?:white|black)(?![\w-])/i;

/**
 * Removes `var(...)` references (and their fallbacks), `url(...)` and quoted
 * text, so `var(--gn-white)` or `content: "black"` are not mistaken for paint.
 */
function stripNonPaint(value) {
  let result = value.replace(URL_OR_QUOTED, " ");
  let guard = 0;

  while (result.includes("var(") && guard < 20) {
    guard += 1;
    result = result.replace(/var\([^()]*\)/g, " ");
  }

  return result;
}

/**
 * Returns the CSS named color (`white`/`black`) used as paint in `value`, or
 * null. `transparent`, `currentColor` and `inherit` are never reported.
 */
function findNamedCssColor(value) {
  if (typeof value !== "string" || value.length === 0) return null;

  const match = NAMED_CSS_COLOR.exec(stripNonPaint(value));

  return match ? match[0].toLowerCase() : null;
}

/**
 * Mantine style props (and a few SVG/Mantine color props) whose value is a
 * color. `dark.*` and the other scale references are token-mapped and
 * allowed; only a literal `white`/`black` (or a literal color) is fixed.
 */
const NAMED_COLOR_JSX_ATTRIBUTES = Object.freeze([
  "c",
  "bg",
  "bd",
  "color",
  "fill",
  "stroke",
  "stopColor",
  "floodColor",
  "lightingColor",
]);

/** CSS properties that carry paint, for `white`/`black` in CSS declarations. */
const COLOR_DECLARATION_PROPERTY =
  /(?:^--|color$|colour$|^background|^border|^fill$|^stroke$|shadow|gradient|^outline|^caret|^accent|decoration|^backdrop|^filter$|^mask)/i;

module.exports = {
  COLOR_DECLARATION_PROPERTY,
  COLOR_UTILITY_PREFIXES,
  NAMED_COLOR_JSX_ATTRIBUTES,
  TAILWIND_DEFAULT_PALETTES,
  TAILWIND_NAMED_COLORS,
  findNamedCssColor,
  findNamedTailwindColorClasses,
  isNamedTailwindColorClass,
};
