const { execFileSync } = require("node:child_process");
const { readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

// Capacitor resolves symlinks when writing Gradle settings. Keep these paths
// relative to workspace links so native fingerprints are stable across stores.
function normalizeCapacitorSettings(source) {
  return source.replace(
    /new File\('(?:[^']*\/)?node_modules\//g,
    "new File('../node_modules/",
  );
}

if (require.main === module) {
  const mobile = join(__dirname, "../apps/mobile");
  execFileSync("pnpm", ["exec", "cap", "sync", ...process.argv.slice(2)], {
    cwd: mobile,
    stdio: "inherit",
  });
  const settings = join(mobile, "android/capacitor.settings.gradle");
  writeFileSync(
    settings,
    normalizeCapacitorSettings(readFileSync(settings, "utf8")),
  );
}

module.exports = { normalizeCapacitorSettings };
