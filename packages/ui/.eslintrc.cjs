const {
  colorRuleOffOverrides,
  migratedColorOverrides,
} = require("@repo/eslint-config/hard-coded-colors");

module.exports = {
  extends: ["@repo/eslint-config/react.js"],
  overrides: [
    {
      // Theme definitions pin today's values (`gamenode`) and generated files
      // come from `pnpm themes:generate`; both are the token source, not
      // consumers of it.
      files: ["src/theme/themes/*.ts", "src/theme/generated/**"],
      rules: {
        "gamenode/no-hard-coded-colors": "off",
      },
    },
    {
      files: [
        "src/theme/experiences/**/*.{ts,tsx}",
        "src/theme/themes/*/screens/**/*.{ts,tsx}",
      ],
      rules: {
        "gamenode/no-hard-coded-colors": "error",
      },
    },
    ...colorRuleOffOverrides(),
    ...migratedColorOverrides("packages/ui"),
  ],
};
