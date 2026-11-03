import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  net,
  protocol,
  screen,
  session,
  shell,
  type IpcMainInvokeEvent,
  type Event as ElectronEvent,
  type MenuItemConstructorOptions,
} from "electron";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { DesktopAuth } from "./auth";
import { bundledPath, navigationPolicy, validWindowState } from "./security";
import type { MenuAction } from "../shared/bridge";

if (process.platform === "linux" && process.env.GAMENODE_X11 === "1") {
  app.commandLine.appendSwitch("ozone-platform", "x11");
  console.info("GameNode: ozone-platform=x11");
}
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);
let window: BrowserWindow;
let auth: DesktopAuth;
const devUrl = !app.isPackaged ? process.env.ELECTRON_RENDERER_URL : undefined;

async function openExternal(url: string) {
  if (typeof url !== "string" || navigationPolicy(url) !== "external")
    throw new Error("Only HTTP(S) links may be opened");
  await shell.openExternal(url);
}
function action(action: MenuAction, ids?: string[]) {
  window.webContents.send("library:action", action, ids);
}
function libraryMenu(ids?: string[]): MenuItemConstructorOptions[] {
  return [
    {
      label: "Import",
      accelerator: "CmdOrCtrl+I",
      click: () => action("import", ids),
    },
    {
      label: "Import into collection…",
      click: () => action("import-collection", ids),
    },
    { label: "Open on GameNode", click: () => action("open", ids) },
    { label: "Copy name", click: () => action("copy", ids) },
    { type: "separator" },
    {
      label: "Select all",
      accelerator: "CmdOrCtrl+A",
      click: () => action("select-all"),
    },
  ];
}
function trusted(event: IpcMainInvokeEvent) {
  if (
    event.sender !== window.webContents ||
    event.senderFrame !== window.webContents.mainFrame ||
    navigationPolicy(event.senderFrame.url, devUrl) !== "app"
  )
    throw new Error("Untrusted IPC sender");
}
function createWindow() {
  const stateFile = join(app.getPath("userData"), "window-state.json");
  let saved: unknown;
  try {
    saved = JSON.parse(readFileSync(stateFile, "utf8"));
  } catch {
    /* Missing or invalid state uses defaults. */
  }
  const state = validWindowState(
    saved,
    screen.getAllDisplays().map((d) => d.workArea),
  )
    ? saved
    : undefined;
  window = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    ...(state
      ? { x: state.x, y: state.y, width: state.width, height: state.height }
      : { width: 1280, height: 800, center: true }),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  if (state?.maximized) window.maximize();
  window.on("close", () => {
    try {
      writeFileSync(
        stateFile,
        JSON.stringify({
          ...window.getNormalBounds(),
          maximized: window.isMaximized(),
        }),
      );
    } catch {
      console.warn("Could not save window state.");
    }
  });
  const navigate = (event: ElectronEvent, url: string) => {
    const policy = navigationPolicy(url, devUrl);
    if (policy !== "app") {
      event.preventDefault();
      if (policy === "external") void openExternal(url).catch(console.error);
    }
  };
  window.webContents.on("will-navigate", navigate);
  window.webContents.on("will-redirect", navigate);
  window.webContents.on("will-attach-webview", (event) =>
    event.preventDefault(),
  );
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (navigationPolicy(url, devUrl) === "external")
      void openExternal(url).catch(console.error);
    return { action: "deny" };
  });
  void window.loadURL(devUrl || "app://gamenode/");
}
function receiveLink(value: string) {
  void auth?.acceptLink(value).catch(() =>
    window.webContents.send("auth:changed", {
      signedIn: !!auth.getToken(),
      error: "Could not save session securely",
    }),
  );
  if (window) {
    if (window.isMinimized()) window.restore();
    window.focus();
  }
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", (_event, args) => {
    const link = args.find((a) => a.startsWith("app.gamenode://"));
    if (link) receiveLink(link);
  });
  app.on("open-url", (event, url) => {
    event.preventDefault();
    receiveLink(url);
  });
  app
    .whenReady()
    .then(async () => {
      if (!app.isPackaged)
        app.setAsDefaultProtocolClient("app.gamenode", process.execPath, [
          process.argv[1],
        ]);
      else app.setAsDefaultProtocolClient("app.gamenode");
      protocol.handle("app", (request) => {
        try {
          const path = bundledPath(request.url, join(__dirname, "../renderer"));
          return path
            ? net.fetch(pathToFileURL(path).href)
            : new Response("Forbidden", { status: 403 });
        } catch {
          return new Response("Bad request", { status: 400 });
        }
      });
      session.defaultSession.setPermissionRequestHandler(
        (wc, permission, callback) =>
          callback(
            wc === window?.webContents && permission === "notifications",
          ),
      );
      session.defaultSession.setPermissionCheckHandler(
        (wc, permission) =>
          wc === window?.webContents && permission === "notifications",
      );
      auth = new DesktopAuth(
        process.env.GAMENODE_SERVER_URL!,
        app.getPath("userData"),
        (change) => window.webContents.send("auth:changed", change),
      );
      await auth.load();
      createWindow();
      const handle = (channel: string, fn: (...args: never[]) => unknown) =>
        ipcMain.handle(channel, (event, ...args) => {
          trusted(event);
          return fn(...(args as never[]));
        });
      handle("auth:token", () => auth.getToken());
      handle("auth:sign-in", (provider) => auth.signIn(provider));
      handle("auth:sign-out", () => auth.signOut());
      handle("external:open", openExternal);
      handle("library:context-menu", (ids: string[]) => {
        if (
          !Array.isArray(ids) ||
          ids.length > 100000 ||
          !ids.every(
            (id) =>
              typeof id === "string" &&
              /^(steam|psn|xbox|epicgames|nintendo):\d+$/.test(id),
          )
        )
          throw new Error("Invalid game selection");
        Menu.buildFromTemplate(libraryMenu(ids)).popup({ window });
      });
      Menu.setApplicationMenu(
        Menu.buildFromTemplate([
          {
            label: "Library",
            submenu: [
              ...libraryMenu(),
              { type: "separator" },
              { role: "quit" },
            ],
          },
          {
            label: "Edit",
            submenu: [
              { role: "undo" },
              { role: "redo" },
              { type: "separator" },
              { role: "cut" },
              { role: "copy" },
              { role: "paste" },
            ],
          },
          {
            label: "View",
            submenu: [
              {
                label: "Cover grid",
                accelerator: "CmdOrCtrl+1",
                click: () => action("grid"),
              },
              {
                label: "Detailed list",
                accelerator: "CmdOrCtrl+2",
                click: () => action("list"),
              },
              { type: "separator" },
              { role: "resetZoom" },
              { role: "zoomIn" },
              { role: "zoomOut" },
              { role: "togglefullscreen" },
            ],
          },
        ]),
      );
    })
    .catch((error) => {
      console.error(error);
      app.quit();
    });
  app.on("window-all-closed", () => app.quit());
}
