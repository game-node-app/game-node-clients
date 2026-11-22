import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  ANDROID_MAIN_DIR,
  checkNativeSplashFiles,
  findStaleNativeSplashFiles,
  renderNativeSplashFiles,
} from "./native-splash";

/**
 * Generates the Android launch-splash resources from the theme catalog:
 *   pnpm --filter mobile splash:generate          (write)
 *   pnpm --filter mobile splash:generate --check  (fail when out of date)
 * `pnpm themes:generate` / `pnpm themes:check` at the repo root run it after
 * the theme generator.
 */
if (process.argv.slice(2).includes("--check")) {
  const outdated = checkNativeSplashFiles();
  if (outdated.length) {
    console.error(
      `Native splash files are out of date:\n${outdated.map((file) => `  ${file}`).join("\n")}\n` +
        "Run `pnpm themes:generate` (or `pnpm --filter mobile splash:generate`) and commit the result.",
    );
    process.exit(1);
  }
  console.log("Native splash files are up to date.");
} else {
  const files = renderNativeSplashFiles();
  for (const file of files) {
    const target = path.join(ANDROID_MAIN_DIR, file.path);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, file.content);
  }
  for (const stale of findStaleNativeSplashFiles(files)) {
    rmSync(path.join(ANDROID_MAIN_DIR, stale));
  }
  console.log(`Generated ${files.map((file) => file.path).join(", ")}`);
}
