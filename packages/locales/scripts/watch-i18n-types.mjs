import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesJsonDir = path.join(
  __dirname,
  "..",
  "src",
  "translations",
  "json",
);
const generatorScript = path.join(__dirname, "generate-i18n-types.mjs");

let debounceTimer = null;
let running = false;
let queued = false;

function getSpawnEnv() {
  const env = { ...process.env };

  // Prevent VS Code auto-attach from binding to this child process.
  delete env.NODE_OPTIONS;
  delete env.VSCODE_INSPECTOR_OPTIONS;

  return env;
}

function runGenerator() {
  if (running) {
    queued = true;
    return;
  }

  running = true;

  const child = spawn(process.execPath, [generatorScript], {
    stdio: "inherit",
    env: getSpawnEnv(),
  });

  child.on("exit", (code, signal) => {
    if (code && code !== 0) {
      const reason = signal ? `signal ${signal}` : `exit code ${code}`;
      console.warn(`[watch] Type generation skipped (${reason}).`);
    }

    running = false;

    if (queued) {
      queued = false;
      runGenerator();
    }
  });
}

function scheduleGenerate() {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    runGenerator();
  }, 120);
}

if (!fs.existsSync(localesJsonDir)) {
  console.error(`Locales directory not found: ${localesJsonDir}`);
  process.exit(1);
}

console.log(`Watching locale JSON files in ${localesJsonDir}`);

// Initial generation so the output is always up-to-date when watch starts.
runGenerator();

const watcher = fs.watch(localesJsonDir, (eventType, filename) => {
  if (!filename || !filename.endsWith(".json")) return;

  console.log(`[watch] ${eventType}: ${filename}`);
  scheduleGenerate();
});

function shutdown() {
  watcher.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
