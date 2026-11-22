const {
  colorRuleOffOverrides,
  legacyColorOverrides,
} = require("@repo/eslint-config/hard-coded-colors");

module.exports = {
  extends: ["@repo/eslint-config/react.js"],
  overrides: [
    // Legacy baseline files stay `warn`; everything else is `error`. The off
    // overrides go last: tests, theme definitions (`src/theme/themes/*.ts`,
    // the token source) and generated files are not consumers of the tokens.
    ...legacyColorOverrides("packages/ui"),
    ...colorRuleOffOverrides(),
  ],
};
