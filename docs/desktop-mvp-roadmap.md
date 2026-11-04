# GameNode Desktop: MVP roadmap

Source: [GameNode Desktop: MVP & Stack Decisions](https://claude.ai/artifact/TKp7K8TksQs4W9md5C7bve) (2026-11-02).
That doc holds the stack reasoning (Electron over Tauri, umu + GE-Proton, OptiScaler rules). The product direction
below replaced its library plan on 2026-11-03. This file orders the work.

Each step is meant to become one OpenSpec change.

MVP = a Windows and Linux Electron app (`apps/desktop`) that finds the games installed on this PC across stores,
launches them, records playtime on GameNode, runs non-Steam games through Proton on Linux, and installs OptiScaler per game.

## Direction

- **A unified launcher, like Playnite.** One library of every game on this PC, whatever the store. Play, track,
  tweak. Installing, updating and downloading stay with each store's own client: Install opens that client on the game.
- **A separate product for a separate audience.** The web and mobile apps are a Letterboxd-style tracker. Desktop is
  for people who want one launcher for everything, connected to their GameNode account. It does not have to mirror
  web features, and web features do not have to fit it.
- **Desktop data only.** Desktop does not use the web connections or the importer (`/v1/connections/*`,
  `/v1/importer/*`). Every game in the desktop library comes from a desktop provider (see below). Two parallel
  sources of "your games" in one UI is the confusion we are avoiding.
- **Installed games only, for now.** Providers read what is on disk. Logging into stores to list owned-but-not-installed
  games is a later provider capability (see Later).
- **Desktop reports back to GameNode.** Detected games and playtime are sent to the server, on by default with a
  setting to turn it off. The app works fully with it off. This is how desktop-only stores (Ubisoft, EA, Battle.net)
  reach the user's GameNode profile. Reported ownership is self-declared and must not feed anything trust-sensitive.

## Desktop UI principle

GameNode Desktop is a native-feeling program, not the website in a window. Share the data layer (`@repo/wrapper`,
`packages/ui` hooks, theme tokens and Mantine primitives); write screens from scratch for desktop use: keyboard,
context menus, multi-select, split panes, local cache, remembered layout. Accept desktop-specific problems
(cache staleness, more UI code to own) for these advantages.

## Providers

A provider is everything the app knows about one game source (a store, a launcher like Heroic, or manual adds).
All provider code runs in the main process; the renderer only gets task-level preload calls (`scanLibrary()`,
`launch(gameKey)`). Two tiers are in the MVP:

- **Tier 0, the provider interface.** Built-in TypeScript. What the rest of the app talks to.
- **Tier 1, declarative manifests.** JSON that describes a provider as data. Every provider, bundled or not, has one.

Code plugins (Tier 2) are not in the MVP; see Later.

### Manifest

The manifest holds everything about a store that is data: where it lives, how to launch, how to match games to
GameNode, which playtime source to use. Its `scan` either names a bundled native scanner or declares a generic one.

```jsonc
// steam.json: data in the manifest, parsing in a bundled native scanner
{
  "id": "steam",
  "name": "Steam",
  "platforms": ["win32", "linux"],
  "roots": {
    "win32": [{ "registry": "HKCU\\Software\\Valve\\Steam", "value": "SteamPath" }],
    "linux": [
      { "path": "~/.steam/steam" },
      { "path": "~/.var/app/com.valvesoftware.Steam/.steam/steam" }
    ]
  },
  "scan": { "native": "steam" },                     // libraryfolders.vdf + appmanifest_*.acf
  "playtime": { "native": "steam" },                 // Steam's own counter, if readable (spike in step 2)
  "launch": { "uri": "steam://rungameid/{id}" },
  "install": { "uri": "steam://install/{id}" },
  "match": { "externalCategory": 1 },                // GET /v1/game/external
  "playtimeSource": "steam"
}
```

```jsonc
// ubisoft.json: fully declarative
{
  "id": "ubisoft",
  "name": "Ubisoft Connect",
  "platforms": ["win32"],
  "scan": {
    "registrySubkeys": "HKLM\\SOFTWARE\\WOW6432Node\\Ubisoft\\Launcher\\Installs",
    "fields": { "id": "$key", "installDir": "InstallDir" }
  },
  "launch": { "uri": "uplay://launch/{id}/0" },
  "match": { "byName": true },                       // until the server has a Ubisoft category (step 5)
  "playtimeSource": "ubisoft"                        // needs the server change in step 5
}
```

Rules:

- **A scanner returns plain records** `{ id, name?, installDir, ...fields }`. The runtime fills the manifest's
  `{placeholders}` from those fields. Native and generic scanners are interchangeable.
- **Generic scanners are added only when a bundled store needs one.** Step 3 needs `registrySubkeys` (Ubisoft, GOG)
  and `files` (a glob plus a JSON reader: Epic `.item` manifests, Heroic's installed lists). Add `sqlite`, `vdf`
  and others only when a store requires them.
- **Native scanners are for formats a manifest cannot describe.** Examples: Steam's two-level VDF, Battle.net's
  protobuf `product.db`, Lutris's database. Each native scanner has fixture tests.
- **Manifests are validated when loaded.** An invalid manifest is skipped and logged; it never stops the other
  providers. Bundled manifests live in `apps/desktop/src/main/providers/`.
- **Launch is restricted.** It is either a URI whose scheme the manifest declares, or an executable inside the
  scanned `installDir`. No shell strings.
- **The library key is `<provider>:<id>`.** The same game installed from two stores is two entries that point to
  one GameNode game.

### Matching

- **Known category:** if the manifest has `match.externalCategory`, look the game up with `GET /v1/game/external`.
  Existing categories: Steam 1, GOG 5, Epic namespace 1001.
- **No category yet:** otherwise, search by name and ask the user to confirm. A confirmed match is cached locally
  and reported in step 5.
- **No match:** the game stays playable. The detail pane offers a manual match.

### Playtime

How the server stores playtime:

- One `UserPlaytime` row per (user, game, source, platform). The game's total is the sum across rows.
- Connection syncs overwrite their row with the store's total. They write a history entry when the row's values
  differ from the store's.

Desktop sends playtime in one of two ways, decided by the provider:

- **A store counter, sent as a total.** Used when the provider can read the store's own total (Steam's
  `localconfig.vdf`). Desktop submits it after the game exits, through the existing `POST /v1/playtime`.
  - It counts every PC and play from before GameNode Desktop was installed.
  - It writes the same row a web Steam connection writes, with the same number, so the two never conflict.
- **Measured sessions, added to the total.** Used for every other provider. A generic process watcher (one for all
  providers) finds processes whose executable, or Wine command line, is inside the game's `installDir`. It records
  each session as `{ sessionId, gameId, source, platformId, startedAt, endedAt }`, queued on disk until the server
  accepts it.
  - The server adds each session to the same (game, source, platform) row and writes a history entry.
  - `sessionId` is generated by the client, so retries are harmless. Sessions from two PCs add up.
  - If the user also has a web connection for that store (Epic, GOG), the next connection sync overwrites the row
    with the store's total, which already includes those sessions. A session can be counted twice only until that
    sync, never permanently.

Rules both ways follow:

- `platformId` is always 6 (PC), as the server's Steam sync uses, so desktop and connection rows line up.
- The source is the store that sells the game, not the launcher that runs it. An Epic game run through Heroic is
  `epicgames`.
- Desktop never sends sessions for a provider that has a store counter.
- Play from before install is not recovered for measured providers. Store logins (Later) can add counters for
  them.

## Assumptions

| Question | Assumed answer | Affects |
| --- | --- | --- |
| macOS in the MVP? | No. Windows and Linux only. | Steps 1, 8 |
| GameNode login required? | Yes. Matching, playtime and reporting go to the user's account. | Step 1 |
| Windows code signing | Decided in step 8 (Azure Artifact Signing vs OV cert). | Step 8 |

Change an assumption and the matching step changes; the order does not.

## Order

```
1 Shell ─► 2 Providers + Steam ─┬─► 3 Epic, GOG, Ubisoft, local exe ─┬─► 4 EA, Battle.net, Heroic, Lutris
                                │                                   └─► 6 Proton runner ─► 7 OptiScaler
                                └─► 5 Reporting to GameNode (server)
                                               8 Release builds ◄── all
```

Step 5 can run in parallel from step 2 on; each store added later reports through it. Step 4 and step 6 can run in
parallel after step 3. Step 7 needs step 6 for its Proton half only.

## Step 1: Desktop shell

**User gets:** nothing on its own. The first tester build is the end of step 2. This step is the base every
later step builds on.

The work is in change `redesign-desktop-ui`, which carries on the archived `desktop-shell-owned-library`. It is rescoped to the shell:

- Keep the following:
  - scaffold, security baseline, sign-in, window state, Linux X11 fallback and CI artifacts;
  - the library UI: grid/list, sidebar, keyboard, selection, detail pane, native menus, remembered layout;
  - the redesign.
- Remove the web-connection data: `useOwnedLibrary`/`loadOwnedSource`, the importer list and import calls
  (menu Import / Import into collection, collection picker, batch import), the persisted owned-library query, and
  the "Manage stores" / no-linked-stores links to web connections.
- The library shows an empty state until step 2 fills it.

**Done when:** a CI build installs on Windows and Linux, signs in, restarts signed in, and shows the empty library.

## Step 2: Provider runtime + Steam

**User gets:** the first usable build. Their installed Steam games in the library, a Play button, and Steam
playtime on GameNode.

- Provider runtime in main: manifest loading and validation, the scanner registry, placeholder filling, launch
  rules, and `scanLibrary()`/`launch()` preload calls. The library model is keyed by `<provider>:<id>` and its
  filters are by provider.
- Steam as a manifest plus native scanner: `libraryfolders.vdf` + `appmanifest_*.acf` on Windows and Linux
  (native and Flatpak Steam), with fixture tests. Launch with `steam://rungameid`; Install opens `steam://install`.
- Matching through `GET /v1/game/external` (category 1). The detail pane shows the GameNode game and adds it to the
  user's GameNode library through collection entries, the same API web uses to add a game. It does not use the
  importer.
- Process watcher in main (generic, `installDir`-based). It shows "running" and records sessions into the on-disk
  queue; queued sessions are sent once step 5 ships the sessions endpoint.
- Steam playtime: spike reading Steam's own counter (`userdata/<id>/config/localconfig.vdf`, per Steam account on
  the PC) and submit it through `POST /v1/playtime` with source `steam`, platform 6. If the spike fails, Steam uses
  measured sessions like every other provider.
- Tray mode: closing the window keeps only the tray process alive while a game runs.
- Spike: `steam://` launch and process watching under `flatpak-spawn --host` (the Flathub path to Steam Deck).
  Record the result.
- Verify scrolling stays smooth with several thousand games in the library (carried over from the shell, which
  has no data to test it with).

**Done when:** a tester installs the CI build on both OSes, sees their installed Steam games matched to GameNode,
launches one, and its playtime appears on GameNode.

## Step 3: Epic, GOG, Ubisoft and local executables

**User gets:** the common Windows stores in the same library, including Ubisoft, which the web can't import.
Any DRM-free game can be added by hand.

- Generic scanners `registrySubkeys` and `files`, each with tests.
- Epic: `files` over `ProgramData\Epic\EpicGamesLauncher\Data\Manifests\*.item`. Match by namespace (category 1001).
  Launch through the `com.epicgames.launcher://` URI.
- GOG: `registrySubkeys` over `GOG.com\Games`. Match by category 5. Launch through Galaxy, or through the game exe
  when Galaxy is absent.
- Ubisoft: the manifest above, matched by name with user confirmation.
- Local `.exe`: a built-in `manual` provider. The user picks the exe and the GameNode game. Runs directly on
  Windows; Linux launch comes in step 6.
- Playtime: sessions recorded by the step 2 watcher for all of the above (sent once step 5 lands).

**Done when:** an Epic, a GOG, a Ubisoft and a manually added game each show as installed, launch, and record
playtime on Windows.

## Step 4: EA, Battle.net, Heroic and Lutris

**User gets:** the rest of the major Windows launchers, and Linux users' Heroic and Lutris libraries.

- EA app and Battle.net: native scanners (spike each format first: EA install data, Battle.net `product.db`),
  launched through their clients.
- Heroic: `files` over its installed lists for Epic, GOG and Amazon. Matches use the original store's category and
  playtime source (an Epic game run by Heroic is still `epicgames`). Launch through `heroic://launch`.
- Lutris: native scanner over its database. Launch through `lutris:rungameid`.

**Done when:** an EA and a Battle.net game launch and record playtime on Windows; an Epic game via Heroic and a
Lutris game launch and record playtime on Linux.

## Step 5: Reporting to GameNode

**User gets:** desktop-found games and playtime on their GameNode profile, on web and mobile too. That includes
stores the web cannot connect to.

Server work (game-node-server):

- **Playtime sessions endpoint:** `POST /v1/playtime/sessions`, as described in Playtime above. It is idempotent on
  `sessionId` and rejects sessions that end in the future, have `endedAt <= startedAt`, or last over 24 hours.
- **New playtime sources:** `ubisoft`, `ea`, `amazon` and `manual` (for user-added exes). `battlenet` and `emulator`
  already exist. A Lutris game uses `emulator` when its runner is an emulator, `manual` otherwise.
- **New GameNode-owned external categories:** Ubisoft, EA and Battle.net (next ids after `NintendoTitleId = 1002`).
  Their unmapped ids go through the existing `registerUnmappedGames(category, entries, userId)`, which already
  records which users own each entry. Moderators map them with the existing tools.
- **Reported games endpoint:** `PUT /v1/desktop/games` with `{ provider, storeId, name, gameId? }[]`.
  - `gameId` is the match the user confirmed on desktop. It applies to that user only; global mappings stay with
    moderators.
  - Reports are a sticky union per user: entries are added or updated, never removed by a later report. Installing
    means the user owns the game, and uninstalling doesn't change that. Whether a game is installed is not sent:
    it changes per PC and the web can't act on it.
  - Manually added exes are not reported. They have no store and the user already picked their GameNode game.
- **A "GameNode Desktop" connection:** a connection type with no account behind it, created by the first report.
  - Web and mobile show it in the connections list like the GOG card ("Import games"). Its importer lists the
    reported games with their store, so web users add them to their library the way they already do for every
    other source. No new web screens.
  - Deleting the connection deletes the reported games. Playtime stays, as it does for other connections.

Desktop work:

- Report the full detected list after every scan, and send queued sessions and store counters.
- A "Sync with GameNode" setting, on by default and explained on first run. Off means nothing leaves the PC except
  the game lookups needed for matching.
- Matching moves from name confirmation to the new categories as moderators fill them.

Decided, with reasons:

- **No device identity.** Sessions add up across PCs without one, and reported games are a sticky union, so two PCs
  never overwrite each other. Nothing is stored on the server per PC.
- **Detected games are not added to the GameNode library automatically.** Installed is not the same as played or
  wanted, and the web library is curated by hand. On desktop the user adds a game from the detail pane; on web,
  through the importer.

**Done when:**

- A Ubisoft game found on desktop shows up in the web importer under GameNode Desktop.
- Its playtime appears on the user's profile.
- A session recorded offline is counted once after reconnecting.

## Step 6: Linux/Proton runner

**User gets:** non-Steam Windows games (local exe, GOG offline installers) playable on Linux from GameNode Desktop.

- Download the umu zipapp from GitHub releases on first use; detect missing Python 3 and tell the user.
- Download and manage GE-Proton releases in the app data folder; default version plus per-game picker.
- One Wine prefix per game; launch with `umu-run`, playtime via the step 2 watcher.
- Settings screen to list/remove downloaded Proton versions.

**Done when:** a local Windows exe added in step 3 launches on Linux (desktop and Steam Deck desktop mode) through
umu + GE-Proton and records playtime.

## Step 7: OptiScaler install and uninstall

**User gets:** one-click OptiScaler per game, safely reversible, blocked where it could get them banned.

- Anti-cheat block: refuse if the game folder contains EasyAntiCheat or BattlEye, or the game is on our blocklist. Explicit warning before any install.
- Version picker; download the release `.7z` from GitHub at runtime, cache it, extract with a bundled 7-Zip binary. Show source link and GPL-3.0 license in the UI.
- Place files next to the main exe as `dxgi.dll` (fallback `winmm.dll` / `version.dll`), keep `OptiScaler.ini` name.
- Back up overwritten files and record installed files so uninstall restores the folder exactly.
- Linux: set `WINEDLLOVERRIDES=<dll>=n,b` for umu launches; for Steam games show the launch-options line with a copy button.
- All file writes happen in the main process behind task-level preload calls (`installOptiScaler(gameKey)`), never a generic write-path API.

**Done when:** install then uninstall on a test game leaves the folder byte-identical; an EAC/BattlEye game is refused; OptiScaler loads in-game on Windows and under umu on Linux.

## Step 8: Release builds

**User gets:** a trusted public download on every supported platform.

- Signed Windows installer (pick Azure Artifact Signing or OV cert here); signing also reduces antivirus false positives from step 7.
- AppImage and Flatpak on Flathub, with the host access step 2's spike proved necessary.
- Add `desktop` as a releasable app in the changesets flow from `docs/releases.md`, and publish builds from the release job.
- Steam Deck Game Mode doc: add GameNode as a non-Steam game.

**Done when:** a tagged release publishes the signed Windows installer, AppImage and Flathub build, and each installs and passes the step 2 smoke test (log in, launch, playtime).

## Later (designed for, not scheduled)

- **Store logins: owned-but-not-installed games.** A provider capability `listOwned()` plus a login flow in an
  isolated session (own partition, no preload, never the app window). Store APIs here are unofficial and break, so
  each store gets its own change. Ubisoft is the first candidate.
- **User-installed manifests (Tier 1 for users).** Load manifests from the user data folder. Show the launch
  schemes and paths a manifest uses before enabling it. This covers small launchers and emulators (playtime source
  `emulator` already exists).
- **Code plugins (Tier 2).** Node plugins run with the user's full permissions, so they follow a trust model like
  VS Code's or Playnite's, not a sandbox. Each runs in its own `utilityProcess` behind the provider interface, so a
  crash doesn't take the app down. Extract that API only after the bundled providers have settled it.

## Deferred (not in any step)

Social features (feed, posts, reviews, journal), cloud saves, DLSS swapper, store downloads, Xbox / Microsoft Store and
Amazon (Windows) local scans, writing Steam launch options directly, controller navigation, macOS.
