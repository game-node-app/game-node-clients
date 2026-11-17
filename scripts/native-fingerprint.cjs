const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const { existsSync, readFileSync } = require("node:fs");
const { createRequire } = require("node:module");
const { join, resolve } = require("node:path");

const CAPACITOR_SETTINGS = "apps/mobile/android/capacitor.settings.gradle";

/**
 * `cap sync` writes the plugin paths of `capacitor.settings.gradle` relative to
 * wherever `node_modules` lives: `../../../node_modules` with the hoisted yarn
 * layout, `../node_modules` with pnpm. That is a workspace layout detail, not a
 * change to the native shell, so hoisted packages are hashed in the legacy form
 * and installed apps keep the fingerprint (and OTA channel) they were built
 * with. `better-auth-capacitor` is installed locally to `apps/mobile` in both
 * layouts, so its path never changed.
 */
function normalizeNativeFile(file, content) {
  if (file !== CAPACITOR_SETTINGS) return content;
  return Buffer.from(
    content
      .toString("utf8")
      .replaceAll(
        /'\.\.\/node_modules\/(?!better-auth-capacitor\/)/g,
        "'../../../node_modules/",
      ),
  );
}

function nativeFingerprint(root = resolve(__dirname, "..")) {
  const mobile = join(root, "apps/mobile");
  const manifest = join(mobile, "package.json");
  const requireMobile = createRequire(manifest);
  const files = execFileSync(
    "git",
    ["ls-files", "-z", "--", "apps/mobile/android/"],
    { cwd: root, encoding: "utf8" },
  )
    .split("\0")
    .filter(
      (file) => file && file !== "apps/mobile/android/version.properties",
    );
  files.push("apps/mobile/capacitor.config.ts");
  const hash = createHash("sha256");
  for (const file of files.sort()) {
    hash
      .update(file)
      .update("\0")
      .update(normalizeNativeFile(file, readFileSync(join(root, file))))
      .update("\0");
  }
  const { dependencies } = JSON.parse(readFileSync(manifest, "utf8"));
  const plugins = Object.keys(dependencies).flatMap((name) => {
    // Read metadata directly because some packages do not export package.json.
    const path = requireMobile.resolve
      .paths(name)
      .map((directory) => join(directory, name, "package.json"))
      .find(existsSync);
    if (!path)
      throw new Error(
        `Install mobile dependencies before fingerprinting: ${name}`,
      );
    const pkg = JSON.parse(readFileSync(path, "utf8"));
    // Capacitor's runtime packages have no plugin metadata, but change the native shell.
    return pkg.capacitor ||
      name === "@capacitor/core" ||
      name === "@capacitor/android"
      ? [`${name}@${pkg.version}`]
      : [];
  });
  hash.update(plugins.sort().join("\0"));
  return hash.digest("hex").slice(0, 16);
}

if (require.main === module) console.log(nativeFingerprint());

module.exports = { nativeFingerprint };
