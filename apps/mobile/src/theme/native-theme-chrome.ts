import { Style } from "@capacitor/status-bar";
import {
  getThemeCatalogEntry,
  type ThemeStatusBarStyle,
} from "@repo/ui";

/**
 * The catalog stores the color of the status bar icons (`light` = light
 * icons). Capacitor's enum is named after the bar background, so `light`
 * icons need `Style.Dark` (dark background, light text).
 */
export function statusBarStyleForCatalogStyle(
  style: ThemeStatusBarStyle,
): Style {
  return style === "light" ? Style.Dark : Style.Light;
}

export type NativeThemeChromeDeviceInfo = {
  platform: string;
  osVersion: string;
};

export type NativeThemeChromeDeps = {
  isNativePlatform(): boolean;
  getDeviceInfo(): Promise<NativeThemeChromeDeviceInfo>;
  enableEdgeToEdge(): Promise<void>;
  disableEdgeToEdge(): Promise<void>;
  setEdgeToEdgeBackground(color: string): Promise<void>;
  setStatusBarStyle(style: Style): Promise<void>;
};

type PlatformKind = "web" | "android" | "android-legacy" | "ios" | "unknown";

export type NativeThemeChromeController = {
  /** Applies the theme's native colors; never rejects. */
  apply(themeId: string): Promise<void>;
  /** Resolves when every queued application finished. */
  flush(): Promise<void>;
};

function ignore(task: () => Promise<unknown> | void): Promise<void> {
  return Promise.resolve()
    .then(() => task())
    .then(() => undefined)
    .catch(() => undefined);
}

/**
 * Applies EdgeToEdge + StatusBar for the active theme.
 *
 * Android < 14 keeps the existing `EdgeToEdge.disable()` behavior (the plugin's
 * layout workaround), so only API 34+ gets the theme background. Writes are
 * queued: a rapid theme switch applies every selection in order and the last
 * one always wins, even when the plugins resolve out of order.
 */
export function createNativeThemeChrome(
  deps: NativeThemeChromeDeps,
): NativeThemeChromeController {
  let platform: Promise<PlatformKind> | null = null;
  let queue: Promise<void> = Promise.resolve();

  const resolvePlatform = (): Promise<PlatformKind> => {
    if (platform) return platform;

    platform = (async (): Promise<PlatformKind> => {
      if (!deps.isNativePlatform()) return "web";

      let info: NativeThemeChromeDeviceInfo;
      try {
        info = await deps.getDeviceInfo();
      } catch {
        // Initialization failure: still try the status bar below.
        return "unknown";
      }

      if (info.platform !== "android") return "ios";

      if (!(Number(info.osVersion) >= 14)) {
        await ignore(() => deps.disableEdgeToEdge());
        return "android-legacy";
      }

      await ignore(() => deps.enableEdgeToEdge());
      return "android";
    })();

    return platform;
  };

  const apply = (themeId: string): Promise<void> => {
    const entry = getThemeCatalogEntry(themeId);

    const run = queue.then(async () => {
      const kind = await resolvePlatform();
      if (kind === "web") return;

      if (kind === "android") {
        await ignore(() =>
          deps.setEdgeToEdgeBackground(entry.native.background),
        );
      }

      await ignore(() =>
        deps.setStatusBarStyle(
          statusBarStyleForCatalogStyle(entry.native.statusBarStyle),
        ),
      );
    });

    queue = run.catch(() => undefined);
    return queue;
  };

  return {
    apply,
    flush: () => queue,
  };
}
