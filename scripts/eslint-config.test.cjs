const assert = require("node:assert/strict");
const { test } = require("node:test");
const { ESLint } = require("eslint");

test("TypeScript lint accepts signature parameters and still rejects unused values", async () => {
  const lint = new ESLint({
    overrideConfig: { rules: { "prettier/prettier": "off" } },
  });
  const options = { filePath: "packages/locales/src/lint-fixture.ts" };
  const [valid] = await lint.lintText(
    "export type Translate = (language: string) => string;",
    options,
  );
  assert.equal(valid.errorCount, 0);
  const [invalid] = await lint.lintText(
    "const unused = 1; export const used = 2;",
    options,
  );
  assert.ok(
    invalid.messages.some(
      (message) =>
        message.ruleId === "@typescript-eslint/no-unused-vars" &&
        message.severity === 2,
    ),
  );
});
