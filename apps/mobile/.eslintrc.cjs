const {
  colorRuleOffOverrides,
  legacyColorOverrides,
} = require("@repo/eslint-config/hard-coded-colors");

module.exports = {
  extends: ["@repo/eslint-config/react.js"],
  globals: { __NATIVE_FINGERPRINT__: "readonly" },
  overrides: [
    // Legacy baseline files stay `warn`; everything else is `error`. The off
    // overrides go last so tests and theme definitions win.
    ...legacyColorOverrides("apps/mobile"),
    ...colorRuleOffOverrides(),
  ],
};
