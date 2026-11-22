# `@repo/eslint-config`

Collection of internal ESLint configurations.

## `gamenode/no-hard-coded-colors`

Local rule that keeps colors themeable (see the `add-app-themes-xbox` change,
design decision 3). It lives in `rules/no-hard-coded-colors.js`, is exposed by
the local plugin in `plugins/gamenode.js`, and is enabled by both
`next.js` and `react.js` (`error`; see "Rollout and legacy baseline"). Authored stylesheets are covered by
`bin/lint-css-colors.js`, which parses them with the PostCSS already used by
Tailwind and is wired into each package's `lint` script.

It reports:

- hex and `rgb()`/`rgba()`/`hsl()`/`hsla()` (plus the other CSS color
  functions) in JSX attributes and style objects;
- strings that are exactly a color literal anywhere in the file (the usual
  shape of token maps and CSS variable maps);
- Tailwind arbitrary color classes such as `bg-[#1a1a1a]`,
  `text-[rgb(…)]` and `[color:#fff]`, with variants and opacity modifiers;
- in `.css`/CSS Modules: those literals in declaration values (including
  gradients, shadows and custom properties such as `--card: #161616`) and in
  `@apply`/`@value` params.

It accepts token references (`var(--gn-brand)`, `bg-paper-2`,
`text-brand-5`), `transparent`/`currentColor`/`inherit`, other named CSS colors and hash fragments inside larger strings.

Artwork may opt out on the line, the next line, or the whole following
JSX element/object/statement:

```tsx
const cover = (
  <>
    {/* theme-exempt: game cover artwork */}
    <Image style={{ background: "#000" }} />
  </>
);
```

The reason is mandatory. Exemptions are only for content art (game art,
recap/awards artwork, platform brand marks) — the rule checks that a reason is
present, reviewers check that it is artwork. In CSS the same comment syntax
works, and a comment on its own line exempts the following rule, at-rule or
declaration:

```css
/* theme-exempt: recap artwork gradient */
.art {
  background: linear-gradient(#f15025, #5c0b06);
}
```

The CSS checker ignores selectors, `url(...)` targets (SVG fragment ids,
data URIs) and quoted strings such as `content: "#fff"`, and it skips the
generated `packages/ui/src/theme/generated/**` styles.

### Named colors

Besides hex/`rgb()`/`hsl()` literals and arbitrary Tailwind colors, the rule
(`named-colors.js`, shared with the CSS checker) reports colors that bypass
the theme without being literals:

- Tailwind default-palette and named-color utilities: `bg-black`, `text-white`,
  `from-black`, `via-black/50`, `text-gray-400`, `bg-zinc-900`,
  `border-neutral-800`, `ring-slate-700/40`, with variants (`hover:`, `md:`,
  `[&>svg]:`) and the `!` modifier. `to-transparent` is fine.
- Mantine/SVG color props with a fixed name: `c="white"`, `bg="black"`,
  `color="white"` (also `bd`, `fill`, `stroke`). `dark.*` is token-mapped and
  allowed.
- The CSS names `white`/`black` in style objects and in CSS color
  declarations (`color: white`, `background: linear-gradient(black, …)`) and in
  `@apply`.

`transparent`, `currentColor` and `inherit` are never reported. The repo's token
palettes (`paper-*`, `surface-*`, `brand-*`, `line-*`, `nav-*`, `dimmed-*`,
`panel*`, `state-*`, `text-subtle`, ...) are allowed without being listed: a
utility is reported only when its color segment is exactly one of Tailwind's
default palettes, which no token palette shadows (a test checks
`packages/config-tailwind/tailwind.config.ts`, so a new token palette is allowed
automatically and a colliding name fails the test).

### Rollout and legacy baseline

The rule is `error` by default in `packages/ui`, `apps/web` and `apps/mobile`
(TS/TSX through `react.js`/`next.js`, CSS through `bin/lint-css-colors.js`);
`apps/admin` is pinned to the `gamenode` theme and stays `warn`. Code that
already violated the rule when the default was flipped is recorded in the
generated `color-baseline.json` (repo-relative path -> violation count). Those
files stay `warn` (`legacyColorOverrides("<package root>")` in each
`.eslintrc`, `getCssColorSeverity` in the CSS checker).

```bash
pnpm colors:check     # fails on new violations or growth (also part of each lint)
pnpm colors:baseline  # lock in progress after migrating files
```

`colors:check` (`bin/colors.js check`) counts violations per file (independent
of severity, honoring `theme-exempt`, tests and theme definitions being off) and
fails when (1) a file outside the baseline has any violation, or (2) a
baseline file has more violations than recorded. Fewer is fine. `colors:baseline`
rewrites the JSON and refuses to record growth unless `--force` is passed, so
it cannot be used to hide new violations. Do not edit the JSON by hand.

Each package's `lint` script runs `colors.js check` for its own package, so
`pnpm lint` and `turbo lint` enforce it; the root `pnpm colors:check` checks all
of them.

Test files and the `packages/ui` theme definitions/generated files
(`**/theme/themes/*.ts`, `**/theme/generated/**`) are off: tests assert colors
on purpose, and theme definitions are the token source.

### CSS checker

Each `lint` script runs ESLint and then:

```bash
node ../../packages/config-eslint/bin/lint-css-colors.js src
```

The CLI prints `file:line:column severity message (rule)` for every finding and
exits non-zero when there is an error. Warnings are legacy baseline files and
never fail the run. Pass one or more directories (or a single `.css` file) to check a
subset:

```bash
cd apps/web
node ../../packages/config-eslint/bin/lint-css-colors.js src/components
```

The nearest `pnpm-workspace.yaml` is used as the repo root, so the baseline
lookup also works when the command runs inside a package.

### Tests

```bash
pnpm --filter @repo/eslint-config test
```

`RuleTester` and the CSS checker run under Node's built-in test runner. The
checker only adds `postcss` (already in the workspace through Tailwind) as a
dev dependency. ESLint 8 legacy configs cannot reference a local plugin by
path, so `plugin-resolver.js` maps only the `eslint-plugin-gamenode` specifier
to `plugins/gamenode.js`. Delete it when the repo moves to flat config.
