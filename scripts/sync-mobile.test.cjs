const assert = require("node:assert/strict");
const { test } = require("node:test");
const { normalizeCapacitorSettings } = require("./sync-mobile.cjs");

test("native plugin paths stay identical across local, global and CI stores", () => {
  const paths = [
    "../../../node_modules/@capacitor/app/android",
    "../../../../../.local/share/pnpm/store/v10/links/@capacitor/app/8.1.2/hash/node_modules/@capacitor/app/android",
    "../../../node_modules/.pnpm/@capacitor+app@8.1.2/node_modules/@capacitor/app/android",
  ];
  for (const path of paths) {
    const source = `project(':capacitor-app').projectDir = new File('${path}')\n`;
    const normalized = normalizeCapacitorSettings(source);
    assert.equal(
      normalized,
      "project(':capacitor-app').projectDir = new File('../node_modules/@capacitor/app/android')\n",
    );
    assert.equal(normalizeCapacitorSettings(normalized), normalized);
  }
  assert.equal(
    normalizeCapacitorSettings("include ':capacitor-app'\n"),
    "include ':capacitor-app'\n",
  );
});
