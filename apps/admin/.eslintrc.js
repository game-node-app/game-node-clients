const {
  colorRuleOffOverrides,
} = require("@repo/eslint-config/hard-coded-colors");

module.exports = {
  extends: ["@repo/eslint-config/next.js"],
  rules: {
    // Admin is pinned to the `gamenode` theme: colors only warn here.
    "gamenode/no-hard-coded-colors": "warn",
  },
  overrides: [...colorRuleOffOverrides()],
};
