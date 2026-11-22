const {
  colorRuleOffOverrides,
  legacyColorOverrides,
} = require("@repo/eslint-config/hard-coded-colors");

module.exports = {
  extends: ["@repo/eslint-config/next.js"],
  rules: {
    "@next/next/no-img-element": "off",
  },
  overrides: [
    // Legacy baseline files stay `warn`; everything else is `error`. The off
    // overrides go last so tests and theme definitions win.
    ...legacyColorOverrides("apps/web"),
    ...colorRuleOffOverrides(),
  ],
};
