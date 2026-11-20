# `@repo/eslint-config`

Collection of internal ESLint configurations.

## `gamenode/no-hard-coded-colors`

Local rule that keeps colors themeable (see the `add-app-themes-xbox` change,
design decision 3). It lives in `rules/no-hard-coded-colors.js`, is exposed by
the local plugin in `plugins/gamenode.js`, and is enabled as `warn` by both
`next.js` and `react.js`. Authored stylesheets are covered by
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
`text-brand-5`), named CSS colors and hash fragments inside larger strings.

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

### Rollout

`hard-coded-colors.js` is the single checked-in list of migrated files. They
are escalated to `error` through ESLint `overrides`; everything else stays
`warn` until the follow-up migration. Add a repo-relative path to
`MIGRATED_COLOR_FILES` after migrating that file (and confirming its lint is
clean). The CSS checker reads the same list, so a migrated stylesheet belongs
there too:

```js
"packages/ui/src/components/auth/sign-in/SignIn.module.css",
```

Each app config calls `migratedColorOverrides("<package root>")`, so JS/TS
entries are only applied by the package that owns them; `eslintrc` override
patterns must be relative to the config file. New experience and theme packs
(`packages/ui/src/theme/experiences/**`, `packages/ui/src/theme/themes/*/**`)
are new code and start as `error` without being listed.

While the rule is in `warn` mode, `web`'s lint script does not pass
`--max-warnings=0` (otherwise legacy warnings would fail `pnpm lint`). Restore
it when the follow-up migration flips the rule to `error` repo-wide.

Test files and the `packages/ui` theme definitions/generated files are exempt:
tests assert colors on purpose, and theme definitions are the token source.

### CSS checker

Each `lint` script runs ESLint and then:

```bash
node ../../packages/config-eslint/bin/lint-css-colors.js src
```

The CLI prints `file:line:column severity message (rule)` for every finding and
exits non-zero when there is an error. Warnings are legacy debt and never fail
the run. Pass one or more directories (or a single `.css` file) to check a
subset:

```bash
cd apps/web
node ../../packages/config-eslint/bin/lint-css-colors.js src/components
```

The nearest `pnpm-workspace.yaml` is used as the repo root, so the severity
list also works when the command runs inside a package.

### Tests

```bash
pnpm --filter @repo/eslint-config test
```

`RuleTester` and the CSS checker run under Node's built-in test runner. The
checker only adds `postcss` (already in the workspace through Tailwind) as a
dev dependency. ESLint 8 legacy configs cannot reference a local plugin by
path, so `plugin-resolver.js` maps only the `eslint-plugin-gamenode` specifier
to `plugins/gamenode.js`. Delete it when the repo moves to flat config.
