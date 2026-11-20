const {
  colorRuleOffOverrides,
  migratedColorOverrides,
} = require("@repo/eslint-config/hard-coded-colors");

module.exports = {
  extends: ["@repo/eslint-config/next.js"],
  overrides: [
    ...colorRuleOffOverrides(),
    ...migratedColorOverrides("apps/admin"),
  ],
};
