const {
  colorRuleOffOverrides,
  migratedColorOverrides,
} = require("@repo/eslint-config/hard-coded-colors");

module.exports = {
  extends: ["@repo/eslint-config/next.js"],
  rules: {
    "@next/next/no-img-element": "off",
  },
  overrides: [
    ...colorRuleOffOverrides(),
    ...migratedColorOverrides("apps/web"),
  ],
};
