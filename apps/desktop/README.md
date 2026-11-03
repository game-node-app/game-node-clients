# GameNode Desktop

Owned games from linked Steam, PlayStation, Xbox, Epic Games and Nintendo accounts.
Desktop owns its screens; the shared packages provide the theme, auth client and API data.

## Development

Use Node 24 and Yarn 1.22.22 from the repository root:

```sh
yarn install
cp apps/desktop/.env.local.example apps/desktop/.env.local
yarn dev:desktop
```

`yarn dev -F desktop` also starts the app. A graphical session is required. If the
Electron binary was omitted from an existing dependency cache, run
`node node_modules/electron/install.js` once.

Set `VITE_PUBLIC_SERVER_URL`, `VITE_PUBLIC_SEARCH_URL` and
`VITE_PUBLIC_S3_BUCKET_URL` in `.env.local`. Production defaults are in
`.env.production`; Vite embeds these public URLs at build time. The build derives
the renderer's CSP connect allowlist from the server and search URLs.

The server must trust `app://gamenode`, the development renderer origin printed by
electron-vite, and the `app.gamenode://` auth callback. It must support the existing
better-auth-capacitor authorization proxy. Sign-in opens in the system browser.
Packaged installers register the callback scheme; development registers the current
Electron invocation. AppImage users may need desktop integration for protocol links.

Sessions use Electron safeStorage in `userData/session.enc`. On Linux, use an OS
keyring; the `basic_text` fallback logs a warning and provides weak protection.
Library caches are scoped to the verified account and removed on sign-out.
Offline access shows cached games read-only with the last sync time. Sign-in and
initial synchronization require a connection.

## Checks and packaging

```sh
yarn workspace desktop test
yarn workspace desktop type-check
yarn workspace desktop lint
yarn build -F desktop
node_modules/.bin/electron apps/desktop/tests/shell.smoke.cjs
yarn workspace desktop package
```

The smoke test opens an isolated test window, checks the renderer boundary and
brand theme, then closes it. Build outputs are `out/`; unsigned NSIS installers
and AppImages go into `dist/`. CI builds both platforms as workflow artifacts;
desktop does not publish releases yet. Windows testers may see SmartScreen.

For the isolated 5,001-game fixture test (no real account required):

```sh
VITE_PUBLIC_SERVER_URL=http://127.0.0.1:5199 yarn workspace desktop build
node_modules/.bin/electron apps/desktop/tests/library.smoke.cjs --password-store=basic
yarn build -F desktop
```

The fixture uses a temporary profile and fake credentials. The final command restores
the production server URLs before packaging. To test removed-display recovery, run
the shell smoke test with `GAMENODE_TEST_OFFSCREEN=1`.

## Windows from WSL

Run the app in a Windows Electron while WSL builds it, without installing:

1. On Windows, unzip `electron-v<version>-win32-x64.zip` (the Electron version in
   `apps/desktop/package.json`) into a folder such as `C:\Users\you\gamenode-electron`.
2. In WSL: `GAMENODE_WIN_ELECTRON=/mnt/c/Users/you/gamenode-electron/electron.exe yarn workspace desktop dev:windows`

Renderer edits hot-reload in the Windows window; main and preload edits restart it.
Close the window to stop; Ctrl+C may leave it open. While this runs, `app.gamenode://`
points at the Windows Electron until the installed app starts again. Deep-link sign-in
and installer behavior need the installed build.

To build the Windows installer from WSL (no Wine install needed):

```sh
yarn workspace desktop package:windows
```

The script maps `Z:` to the WSL root during the build and removes the mapping afterwards;
it refuses to run if `Z:` is already in use. Output: `dist/GameNode Setup <version>.exe`.

## Linux

For Wayland/NVIDIA rendering trouble, start with `GAMENODE_X11=1`; the app logs
`ozone-platform=x11` before creating its window:

```sh
GAMENODE_X11=1 yarn dev:desktop
GAMENODE_X11=1 ./GameNode-0.1.0.AppImage
```

AppImages require FUSE on many distributions. If it is unavailable:

```sh
./GameNode-0.1.0.AppImage --appimage-extract-and-run
```

## Keyboard and mouse

Focus the games pane to use the following shortcuts. Text inputs keep their normal editing behavior.

| Input                                  | Action                                           |
| -------------------------------------- | ------------------------------------------------ |
| Type a name / Backspace / Escape       | Filter / remove a character / clear filter       |
| Arrow keys                             | Move focused game (up/down follows grid columns) |
| Enter                                  | Open focused game's details                      |
| Space                                  | Toggle focused game selection                    |
| Ctrl+A                                 | Select all listed games                          |
| Ctrl+I                                 | Import selected games not already in GameNode    |
| Ctrl+1 / Ctrl+2                        | Cover grid / detailed list                       |
| Click / Ctrl+click / Shift+click       | Select one / toggle / select a range             |
| Right-click                            | Native game menu acting on selection             |
| Left/right on a focused pane separator | Resize the pane                                  |

Click a list column header to sort; click again to reverse it. Drag either pane
separator to resize it. View, sort, filter and pane widths survive restarts.
Window bounds are restored when at least part of the window is on a connected display.

Acceptance still requires installing the CI artifacts on real Windows and Linux,
then checking browser login, cancel, restart, expired sessions, imports, offline
startup and a library of several thousand games.

References: [Electron protocol](https://www.electronjs.org/docs/latest/api/protocol),
[safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage),
[electron-vite](https://electron-vite.org/guide/).
