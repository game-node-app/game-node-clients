const assert = require("node:assert/strict");
const { mkdtempSync, rmSync, writeFileSync, readFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { app } = require("electron");
app.setAsDefaultProtocolClient = () => true;
const directory = mkdtempSync(join(tmpdir(), "gamenode-shell-"));
const offscreen = process.env.GAMENODE_TEST_OFFSCREEN === "1";
const saved = {
  x: offscreen ? 10000000 : 40,
  y: offscreen ? 10000000 : 40,
  width: 1000,
  height: 700,
  maximized: !offscreen,
};
const stateFile = join(directory, "window-state.json");
writeFileSync(stateFile, JSON.stringify(saved));
app.setPath("userData", directory);
const timeout = setTimeout(() => {
  console.error("Shell smoke test timed out");
  app.exit(1);
}, 30000);
app.once("browser-window-created", (_event, window) => {
  window.webContents.once("did-finish-load", async () => {
    try {
      const result = await window.webContents
        .executeJavaScript(`new Promise(resolve => {
        const poll = () => document.body.innerText.includes('Your games, together.') ? resolve({ require: typeof require, process: typeof process, keys: Object.keys(window.gamenode), brand: getComputedStyle(document.documentElement).getPropertyValue('--mantine-color-brand-6').trim() }) : setTimeout(poll, 50);
        poll();
      })`);
      assert.equal(result.require, "undefined");
      assert.equal(result.process, "undefined");
      assert.equal(result.brand.toLowerCase(), "#f15025");
      assert.deepEqual(
        result.keys.sort(),
        [
          "getToken",
          "onMenuAction",
          "onSessionChanged",
          "openExternal",
          "showAppMenu",
          "showGameContextMenu",
          "signIn",
          "signOut",
        ].sort(),
      );
      const prefs = window.webContents.getLastWebPreferences();
      assert.equal(prefs.sandbox, true);
      assert.equal(prefs.contextIsolation, true);
      assert.equal(prefs.nodeIntegration, false);
      const bounds = window.getNormalBounds();
      if (offscreen) {
        assert.notEqual(bounds.x, saved.x);
        assert.notEqual(bounds.y, saved.y);
      } else {
        assert.equal(bounds.width, saved.width);
        assert.equal(bounds.height, saved.height);
        assert.equal(window.isMaximized(), true);
      }
      await assert.rejects(
        window.webContents.executeJavaScript(
          "window.gamenode.openExternal('file:///etc/passwd')",
        ),
      );
      await assert.rejects(
        window.webContents.executeJavaScript(
          "window.gamenode.signIn('unknown')",
        ),
      );
      console.log(
        `Shell smoke passed: renderer, brand, sandbox, bridge, IPC validation, ${offscreen ? "off-screen fallback" : "restored maximized window"}`,
      );
      clearTimeout(timeout);
      window.close();
      const persisted = JSON.parse(readFileSync(stateFile, "utf8"));
      assert.equal(persisted.width, bounds.width);
      assert.equal(persisted.maximized, !offscreen);
      app.exit(0);
    } catch (error) {
      console.error(error);
      app.exit(1);
    }
  });
});
app.on("will-quit", () => rmSync(directory, { recursive: true, force: true }));
require("../out/main/index.js");
