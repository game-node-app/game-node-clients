const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { dirname, join } = require("node:path");
const { test } = require("node:test");
const { nativeFingerprint } = require("./native-fingerprint.cjs");

test("native fingerprint ignores web/version changes and tracks native inputs and installed plugins", (t) => {
  const root = mkdtempSync(join(tmpdir(), "native-fingerprint-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, value) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(
      join(root, path),
      typeof value === "string" ? value : JSON.stringify(value),
    );
  };
  const dependencies = {
    "@capacitor/core": "^7",
    "@capacitor/android": "^7",
    plugin: "^7",
    web: "*",
  };
  write("apps/mobile/package.json", { dependencies });
  write("apps/mobile/capacitor.config.ts", "export default {};\n");
  write("apps/mobile/android/app/build.gradle", "// Native shell\n");
  write("apps/mobile/android/version.properties", "VERSION_CODE=61\n");
  for (const name of Object.keys(dependencies)) {
    write(`node_modules/${name}/package.json`, {
      name,
      version: "7.0.0",
      exports: { ".": "./index.js" },
      ...(name === "plugin"
        ? { capacitor: { android: { src: "android" } } }
        : {}),
    });
  }
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["add", "apps"], { cwd: root });
  const initial = nativeFingerprint(root);
  assert.match(initial, /^[a-f0-9]{16}$/);
  assert.equal(nativeFingerprint(root), initial);
  write("apps/mobile/src/App.tsx", "// Web-only change\n");
  write("apps/mobile/android/version.properties", "VERSION_CODE=62\n");
  write("node_modules/web/package.json", { version: "8.0.0" });
  write("apps/mobile/package.json", {
    version: "1.9.0",
    dependencies: Object.fromEntries(Object.entries(dependencies).reverse()),
  });
  assert.equal(nativeFingerprint(root), initial);

  for (const [path, value] of [
    ["apps/mobile/android/app/build.gradle", "// Changed native shell\n"],
    ["apps/mobile/capacitor.config.ts", "export default { plugins: {} };\n"],
    ["node_modules/plugin/package.json", { version: "7.1.0", capacitor: {} }],
    ["node_modules/@capacitor/core/package.json", { version: "7.1.0" }],
    ["node_modules/@capacitor/android/package.json", { version: "7.1.0" }],
  ]) {
    const before = nativeFingerprint(root);
    write(path, value);
    assert.notEqual(nativeFingerprint(root), before, path);
  }
  write("apps/mobile/android/new.gradle", "// Added native input\n");
  const before = nativeFingerprint(root);
  execFileSync("git", ["add", "apps/mobile/android/new.gradle"], { cwd: root });
  assert.notEqual(nativeFingerprint(root), before);
});
