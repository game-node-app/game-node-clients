const {
  colorRuleOffOverrides,
  migratedColorOverrides,
} = require("@repo/eslint-config/hard-coded-colors");

module.exports = {
  extends: ["@repo/eslint-config/react.js"],
  globals: { __NATIVE_FINGERPRINT__: "readonly" },
  overrides: [
    ...colorRuleOffOverrides(),
    ...migratedColorOverrides("apps/mobile"),
  ],
};
