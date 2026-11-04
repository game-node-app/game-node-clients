// Build with VITE_PUBLIC_SERVER_URL=http://127.0.0.1:5199 before running this fixture test.
const assert = require("node:assert/strict");
const { mkdtempSync, rmSync, readFileSync, existsSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { createServer } = require("node:http");
const { app, shell, Menu } = require("electron");
app.setAsDefaultProtocolClient = () => true;
const directory = mkdtempSync(join(tmpdir(), "gamenode-library-"));
app.setPath("userData", directory);
let callback,
  expired = false;
const forbiddenRequests = [];
const server = createServer(async (request, response) => {
  response.setHeader(
    "Access-Control-Allow-Origin",
    request.headers.origin || "app://gamenode",
  );
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "authorization,content-type",
  );
  const url = new URL(request.url, "http://127.0.0.1:5199");
  if (/^\/v1\/(connections|importer)(?:\/|$)/.test(url.pathname)) {
    forbiddenRequests.push(url.pathname);
    response.writeHead(500).end();
    return;
  }
  if (request.method === "OPTIONS") {
    response.writeHead(204).end();
    return;
  }
  if (
    url.pathname !== "/v1/auth/sign-in/social" &&
    request.headers.authorization !== "Bearer fixture.signature"
  ) {
    response.writeHead(401).end();
    return;
  }
  response.setHeader("Content-Type", "application/json");
  if (expired) {
    response.writeHead(401).end(JSON.stringify({ message: "Expired" }));
    return;
  }
  const body = await new Promise((resolve) => {
    let text = "";
    request.on("data", (data) => (text += data));
    request.on("end", () => resolve(text ? JSON.parse(text) : {}));
  });
  let result;
  if (url.pathname === "/v1/auth/sign-in/social") {
    callback = body.callbackURL;
    result = { url: "https://accounts.google.com/oauth?state=test" };
  } else if (url.pathname === "/v1/auth/get-session")
    result = {
      session: {
        id: "test-session",
        userId: "test-user",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
      user: {
        id: "test-user",
        name: "Tester",
        email: "tester@example.test",
        emailVerified: true,
      },
    };
  else result = {};
  response.end(JSON.stringify(result));
});
server.listen(5199, "127.0.0.1");
shell.openExternal = async (url) => {
  if (url.includes("capacitor-authorization-proxy"))
    setTimeout(
      () =>
        app.emit(
          "open-url",
          { preventDefault() {} },
          callback +
            "?cookie=" +
            encodeURIComponent(
              "better-auth.session_token=fixture.signature; Path=/",
            ),
        ),
      10,
    );
};
const timeout = setTimeout(() => {
  console.error("Library smoke timed out");
  app.exit(1);
}, 60000);
app.once("browser-window-created", (_event, window) => {
  window.webContents.on("console-message", (event) => {
    if (event.level === "error" || event.level === "warning")
      console.log("Renderer:", event.message);
  });
  window.webContents.once("did-finish-load", async () => {
    const js = (code) => window.webContents.executeJavaScript(code);
    const waitFor = (code) =>
      js(
        `new Promise((resolve,reject) => { const deadline=Date.now()+10000; const poll = () => { if (${code}) resolve(true); else if(Date.now()>deadline) reject(new Error(${JSON.stringify(code)})); else setTimeout(poll,50); }; poll(); })`,
      );
    try {
      await waitFor(
        "document.body.innerText.includes('Your games, together.')",
      );
      await js("window.gamenode.signIn('google')");
      await waitFor("document.body.innerText.includes('No games yet')");
      assert.ok(existsSync(join(directory, "session.enc")));
      assert.ok(
        !readFileSync(join(directory, "session.enc")).includes(
          Buffer.from("fixture.signature"),
        ),
      );
      assert.ok(
        await js(
          "document.body.innerText.includes('Games installed on this PC will appear here.')",
        ),
      );
      assert.equal(
        await js("document.querySelectorAll('[role=option]').length"),
        0,
      );
      const labels = (menu) =>
        menu.items
          .filter((item) => item.type !== "separator")
          .map((item) => item.label);
      assert.deepEqual(
        labels(
          Menu.getApplicationMenu().items.find(
            (item) => item.label === "Library",
          ).submenu,
        ),
        ["Open on GameNode", "Copy name", "Select all", "Quit"],
      );
      const buildMenu = Menu.buildFromTemplate;
      let contextLabels;
      Menu.buildFromTemplate = (template) => {
        const menu = buildMenu(template);
        contextLabels = labels(menu);
        menu.popup = () => {};
        return menu;
      };
      await js("window.gamenode.showGameContextMenu(['steam:1'])");
      Menu.buildFromTemplate = buildMenu;
      assert.deepEqual(contextLabels, [
        "Open on GameNode",
        "Copy name",
        "Select all",
      ]);
      await js("document.querySelector('[aria-label=\"User menu\"]').click()");
      await waitFor(
        "document.body.innerText.includes('Tester') && document.body.innerText.includes('Sign out')",
      );
      assert.ok(await js("!document.body.innerText.includes('Manage stores')"));
      await js(
        "document.body.click(); localStorage.setItem('gamenode-layout', JSON.stringify({filter:'removed-source'})); location.reload()",
      );
      await waitFor("document.body.innerText.includes('No games yet')");
      assert.ok(
        await js(
          "document.querySelector('[aria-current=true]').innerText.includes('All games')",
        ),
      );
      await js(
        "Object.defineProperty(navigator, 'onLine', {configurable:true, value:false}); window.dispatchEvent(new Event('offline'))",
      );
      await waitFor(
        "document.querySelector('[role=status]')?.innerText === 'Offline'",
      );
      await js("document.querySelector('[aria-label=\"User menu\"]').click()");
      await waitFor(
        "document.body.innerText.includes('Tester') && document.body.innerText.includes('Sign out')",
      );
      await js(
        "localStorage.setItem('gamenode-library:old-user', 'old cache'); Array.from(document.querySelectorAll('[role=menuitem]')).find(item => item.innerText.includes('Sign out')).click()",
      );
      await waitFor(
        "document.body.innerText.includes('Your games, together.')",
      );
      assert.equal(existsSync(join(directory, "session.enc")), false);
      assert.equal(
        await js("localStorage.getItem('gamenode-library:old-user')"),
        null,
      );
      await js(
        "Object.defineProperty(navigator, 'onLine', {configurable:true, value:true}); window.gamenode.signIn('google')",
      );
      await waitFor("document.body.innerText.includes('No games yet')");
      expired = true;
      await js(
        "localStorage.setItem('gamenode-library:test-user', 'old cache'); location.reload()",
      );
      await waitFor(
        "document.body.innerText.includes('Your games, together.')",
      );
      assert.equal(existsSync(join(directory, "session.enc")), false);
      assert.equal(
        await js("localStorage.getItem('gamenode-library:test-user')"),
        null,
      );
      assert.deepEqual(forbiddenRequests, []);
      console.log(
        "Library smoke passed: empty library, no web-store requests, native menus, offline user menu, sign-out and expiry",
      );
      clearTimeout(timeout);
      window.close();
      server.close();
      app.exit(0);
    } catch (error) {
      console.error(error);
      app.exit(1);
    }
  });
});
app.on("will-quit", () => rmSync(directory, { recursive: true, force: true }));
require("../out/main/index.js");
