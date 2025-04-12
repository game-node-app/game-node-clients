/*
 * This is a custom ESLint configuration for use with
 * Next.js apps.
 */

module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    "plugin:@next/eslint-plugin-next/recommended",
    "prettier",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "react",
    "@typescript-eslint",
    "react-hooks",
    "react-refresh",
    "@next/eslint-plugin-next",
  ],

  rules: {
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "import/prefer-default-export": "off",
    "react/no-unescaped-entities": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-require-imports": "off",
    "react/jsx-no-target-blank": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "prettier/prettier": ["off", { endOfLine: "auto" }],
  },
  overrides: [
    {
      files: ["*.config.js"],
      env: {
        node: true,
      },
    },
  ],
};
