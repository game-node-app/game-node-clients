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
  offline = false,
  expired = false,
  imported = new Set();
const rows = Array.from({ length: 5000 }, (_, index) => ({
  id: index + 1,
  uid: String(index + 1),
  name: `Game ${String(index + 1).padStart(5, "0")}`,
  year: 2000 + (index % 25),
  gameId: index + 1,
  game: { id: index + 1, name: `Game ${index + 1}`, cover: null },
  isInLibrary: index === 0,
}));
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
  if (request.method === "OPTIONS") {
    response.writeHead(204).end();
    return;
  }
  if (offline) {
    request.socket.destroy();
    return;
  }
  const url = new URL(request.url, "http://127.0.0.1:5199");
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
  else if (url.pathname === "/v1/connections/own")
    result = [{ type: "steam" }, { type: "psn" }, { type: "xbox" }];
  else if (url.pathname === "/v1/importer/xbox") {
    response
      .writeHead(503)
      .end(JSON.stringify({ message: "Xbox temporarily unavailable" }));
    return;
  } else if (
    url.pathname === "/v1/importer/steam" ||
    url.pathname === "/v1/importer/psn"
  ) {
    const data = url.pathname.endsWith("steam")
      ? rows
      : [{ ...rows[0], name: "PSN exclusive" }];
    const offset = Number(url.searchParams.get("offset")),
      limit = Number(url.searchParams.get("limit"));
    result = {
      data: data.slice(offset, offset + limit).map((game) => ({
        ...game,
        isInLibrary: game.isInLibrary || imported.has(game.id),
      })),
      pagination: {
        totalItems: data.length,
        totalPages: Math.ceil(data.length / limit),
        hasNextPage: offset + limit < data.length,
      },
    };
  } else if (url.pathname.endsWith("/import")) {
    const ids = body.externalGameIds.filter((id) => id !== 1);
    ids.forEach((id) => imported.add(id));
    result = { importedCount: ids.length, skippedCount: 0 };
  } else if (url.pathname.startsWith("/v1/librar"))
    result = { collections: [{ id: "collection", name: "Favorites" }] };
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
    const key = (key, options = {}) =>
      js(
        `document.querySelector('[role=listbox]').dispatchEvent(new KeyboardEvent('keydown', ${JSON.stringify({ key, bubbles: true, ...options })}))`,
      );
    try {
      await waitFor(
        "document.body.innerText.includes('Your games, together.')",
      );
      await js("window.gamenode.signIn('google')");
      await waitFor("document.body.innerText.includes('5001 games')");
      assert.ok(existsSync(join(directory, "session.enc")));
      assert.ok(
        !readFileSync(join(directory, "session.enc")).includes(
          Buffer.from("fixture.signature"),
        ),
      );
      assert.ok(
        await js("document.querySelectorAll('[role=option]').length < 150"),
      );
      await waitFor("document.querySelector('[aria-label=\"Load failed · Retry\"]')");
      Menu.getApplicationMenu()
        .items.find((item) => item.label === "View")
        .submenu.items.find((item) => item.label === "Detailed list")
        .click();
      await waitFor("document.querySelector('.list-columns')");
      await js("document.querySelector('[role=listbox]').focus()");
      await key("ArrowDown");
      await key("ArrowDown");
      await key(" ");
      assert.equal(
        await js(
          "document.querySelector('[role=listbox]').getAttribute('aria-activedescendant')",
        ),
        "game-steam:3",
      );
      assert.equal(
        await js("document.querySelectorAll('[aria-selected=true]').length"),
        1,
      );
      await key("Enter");
      assert.ok(
        await js(
          "document.querySelector('[aria-label=\"Game details\"]').innerText.includes('Game 00003')",
        ),
      );
      await js(
        "document.querySelector('[role=option]').click(); document.querySelectorAll('[role=option]')[3].dispatchEvent(new MouseEvent('click', {bubbles:true,shiftKey:true}))",
      );
      assert.equal(
        await js("document.querySelectorAll('[aria-selected=true]').length"),
        4,
      );
      await key("g");
      await key("a");
      await key("m");
      await key("e");
      assert.equal(await js("document.querySelector('input').value"), "game");
      await key("Escape");
      Menu.getApplicationMenu()
        .items.find((item) => item.label === "View")
        .submenu.items.find((item) => item.label === "Detailed list")
        .click();
      await waitFor("document.querySelector('.list-columns')");
      await js("document.querySelectorAll('.list-columns button')[2].click()");
      await js("document.querySelector('[role=listbox]').scrollTop = 1000000");
      await waitFor(
        "Array.from(document.querySelectorAll('[role=option]')).some(el => el.innerText.includes('Game 00975'))",
      );
      assert.ok(
        await js("document.querySelectorAll('[role=option]').length < 150"),
      );
      await js("document.querySelector('[role=listbox]').scrollTop=0");
      await waitFor("document.querySelector('[role=option]')");
      await js("document.querySelectorAll('[role=option]')[1].click()");
      Menu.getApplicationMenu()
        .items.find((item) => item.label === "Library")
        .submenu.items.find((item) => item.label === "Import")
        .click();
      await waitFor(
        "document.body.innerText.includes('imported into GameNode')",
      );
      await new Promise((resolve) => setTimeout(resolve, 1200));
      assert.ok(
        await js("!!localStorage.getItem('gamenode-library:test-user')"),
      );
      offline = true;
      await js("location.reload()");
      await waitFor("document.body.innerText.includes('Offline · read-only')");
      assert.ok(await js("document.querySelector('[role=listbox]') !== null"));
      assert.ok(
        await js(
          "Array.from(document.querySelectorAll('button')).filter(b => b.innerText === 'Import').every(b => b.disabled)",
        ),
      );
      offline = false;
      expired = true;
      await js("location.reload()");
      await waitFor(
        "document.body.innerText.includes('Your games, together.')",
      );
      assert.equal(existsSync(join(directory, "session.enc")), false);
      assert.equal(
        await js("localStorage.getItem('gamenode-library:test-user')"),
        null,
      );
      console.log(
        "Library smoke passed: browser callback, encrypted storage, 5001 games, virtualization, keyboard, range selection, native menus, import, cache, offline and expiry",
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
