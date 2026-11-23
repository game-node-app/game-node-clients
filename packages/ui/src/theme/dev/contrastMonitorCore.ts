/**
 * Development-only contrast monitor (see `ContrastMonitor.tsx`).
 *
 * New components keep being written against the dark default theme and then
 * show unreadable text or solid dark blocks under a light theme. This module
 * finds both while developing:
 *
 *  - `axe-core`'s `color-contrast` rule (text that is hard to read);
 *  - a heuristic for large, opaque, near-black blocks in a light theme
 *    (images/video and anything inside `[data-gn-scope]` are skipped: those are
 *    dark on purpose).
 *
 * Each offender is warned once in the console with a readable component hint
 * and outlined with a dashed danger outline. Nothing here runs in production:
 * the component is only imported behind a `NODE_ENV`/`import.meta.env.DEV`
 * guard in the apps, and `axe-core` is loaded lazily when the monitor starts.
 *
 * Verify by hand: `localStorage.setItem("gn-contrast-monitor", "on")`, reload,
 * and look for `[gn-contrast]` warnings (`window.__gnContrastMonitor.run()`
 * forces a scan). `"off"` disables it.
 */

/* global process */

import { DEFAULT_THEME_ID, getThemeCatalogEntry } from "../generated/catalog";

export const CONTRAST_MONITOR_STORAGE_KEY = "gn-contrast-monitor";
export const CONTRAST_ATTRIBUTE = "data-gn-contrast";
export const CONTRAST_STYLE_ID = "gn-contrast-monitor-style";

export type MonitorPreference = "on" | "off" | null;
export type ColorScheme = "light" | "dark";

export type ContrastIssue = {
  kind: "text-contrast" | "dark-block";
  element: Element;
  hint: string;
  message: string;
};

/** The subset of axe-core the monitor needs (mocked in tests). */
export type AxeLike = {
  run(
    context: Element | Document,
    options: Record<string, unknown>,
  ): Promise<{
    violations: Array<{
      id: string;
      nodes: Array<{
        element?: Element | null;
        target?: unknown[];
        any?: Array<{ data?: Record<string, unknown> }>;
      }>;
    }>;
  }>;
};

export function readMonitorPreference(
  storage: Pick<Storage, "getItem"> | null | undefined,
): MonitorPreference {
  try {
    const value = storage?.getItem(CONTRAST_MONITOR_STORAGE_KEY);
    return value === "on" || value === "off" ? value : null;
  } catch {
    // Private windows and blocked site data throw on access.
    return null;
  }
}

/**
 * On by default only when the active theme's color scheme differs from the
 * default theme's (that is where "built against dark only" bugs show up).
 * `localStorage["gn-contrast-monitor"]` overrides in both directions. Always
 * off outside development.
 */
export function shouldEnableMonitor({
  isDev,
  preference,
  scheme,
  defaultScheme,
}: {
  isDev: boolean;
  preference: MonitorPreference;
  scheme: ColorScheme;
  defaultScheme: ColorScheme;
}): boolean {
  if (!isDev) return false;
  if (preference === "off") return false;
  if (preference === "on") return true;
  return scheme !== defaultScheme;
}

export function getDefaultColorScheme(): ColorScheme {
  return getThemeCatalogEntry(DEFAULT_THEME_ID).colorScheme;
}

/** The active theme's color scheme: catalog by `data-theme`, then Mantine's attribute. */
export function getActiveColorScheme(doc: Document): ColorScheme {
  const root = doc.documentElement;
  const themeId = root.getAttribute("data-theme");

  if (themeId) return getThemeCatalogEntry(themeId).colorScheme;

  return root.getAttribute("data-mantine-color-scheme") === "light"
    ? "light"
    : getDefaultColorScheme();
}

/* ------------------------------ colors ------------------------------ */

export type Rgba = { r: number; g: number; b: number; a: number };

/** Parses computed `rgb()/rgba()` and `color(srgb …)` values; null for other formats. */
export function parseCssColor(value: string): Rgba | null {
  const text = value.trim().toLowerCase();

  if (text === "transparent") return { r: 0, g: 0, b: 0, a: 0 };

  const legacy =
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(
      text,
    );
  if (legacy) {
    return {
      r: Number(legacy[1]),
      g: Number(legacy[2]),
      b: Number(legacy[3]),
      a: parseAlpha(legacy[4]),
    };
  }

  const srgb =
    /^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(
      text,
    );
  if (srgb) {
    return {
      r: Number(srgb[1]) * 255,
      g: Number(srgb[2]) * 255,
      b: Number(srgb[3]) * 255,
      a: parseAlpha(srgb[4]),
    };
  }

  return null;
}

function parseAlpha(value: string | undefined): number {
  if (value === undefined) return 1;
  return value.endsWith("%") ? Number.parseFloat(value) / 100 : Number(value);
}

/** WCAG relative luminance (0 = darkest, 1 = lightest). */
export function relativeLuminance({ r, g, b }: Rgba): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/* ------------------------------ hints ------------------------------- */

// Next CSS modules (`Hero_card__x1y2z`) and Vite CSS modules (`_card_x1y2z_1`).
const NEXT_MODULE_CLASS = /^[A-Za-z][\w-]*_[\w-]+__[\w-]{4,}$/;
const VITE_MODULE_CLASS = /^_[\w-]+_[\w-]{4,}_\d+$/;

function elementLabel(element: Element): string {
  const classes = Array.from(element.classList)
    .filter((name) => !name.startsWith("mantine-") || name.length < 40)
    .slice(0, 3);
  const id = element.id ? `#${element.id}` : "";

  return `${element.tagName.toLowerCase()}${id}${classes
    .map((name) => `.${name}`)
    .join("")}`;
}

function ownHint(element: Element): string | null {
  const slot = element.getAttribute("data-slot");
  if (slot) return `[data-slot="${slot}"]`;

  const testId = element.getAttribute("data-testid");
  if (testId) return `[data-testid="${testId}"]`;

  for (const name of Array.from(element.classList)) {
    if (NEXT_MODULE_CLASS.test(name) || VITE_MODULE_CLASS.test(name)) {
      return `.${name}`;
    }
  }

  const mantine = Array.from(element.classList).find((name) =>
    /^mantine-[A-Za-z]+-[A-Za-z]+$/.test(name),
  );
  return mantine ? `.${mantine}` : null;
}

/**
 * A readable pointer to the component behind an element: the element itself
 * plus the nearest ancestor (or self) with a `data-slot`, `data-testid`, CSS
 * module class or Mantine class.
 */
export function describeElement(element: Element): string {
  const label = elementLabel(element);
  let current: Element | null = element;

  for (let depth = 0; current && depth < 12; depth += 1) {
    const hint = ownHint(current);
    if (hint)
      return current === element ? `${hint} (${label})` : `${label} in ${hint}`;
    current = current.parentElement;
  }

  return label;
}

/* ------------------------- dark block heuristic ------------------------- */

const SKIPPED_TAGS = new Set([
  "IMG",
  "VIDEO",
  "CANVAS",
  "SVG",
  "PICTURE",
  "IFRAME",
  "OBJECT",
  "HTML",
  "BODY",
  "SCRIPT",
  "STYLE",
]);

export const DARK_BLOCK_LUMINANCE = 0.05;
export const DARK_BLOCK_MIN_WIDTH = 160;
export const DARK_BLOCK_MIN_HEIGHT = 64;
const DARK_BLOCK_MIN_ALPHA = 0.85;

/**
 * Large opaque near-black elements while the theme is light. Elements inside
 * `[data-gn-scope]` (a re-themed subtree) or `[data-gn-artwork]` (fixed-palette
 * artwork that is dark by design but keeps the active theme's tokens, such as
 * the Guild hall), elements with an image background, and media elements are
 * skipped. Text inside them is still checked by axe.
 */
export function findDarkBlocks(
  root: Document | Element,
  win: Window,
): Element[] {
  const found: Element[] = [];

  for (const element of Array.from(root.querySelectorAll("*"))) {
    if (SKIPPED_TAGS.has(element.tagName.toUpperCase())) continue;
    if (element.closest("[data-gn-scope], [data-gn-artwork]")) continue;

    const style = win.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") continue;
    if (style.backgroundImage.includes("url(")) continue;

    const color = parseCssColor(style.backgroundColor);
    if (!color || color.a < DARK_BLOCK_MIN_ALPHA) continue;
    if (relativeLuminance(color) >= DARK_BLOCK_LUMINANCE) continue;

    const rect = element.getBoundingClientRect();
    if (
      rect.width < DARK_BLOCK_MIN_WIDTH ||
      rect.height < DARK_BLOCK_MIN_HEIGHT
    ) {
      continue;
    }

    found.push(element);
  }

  // Report the outermost block only: its children are part of the same problem.
  return found.filter(
    (element) =>
      !found.some((other) => other !== element && other.contains(element)),
  );
}

/* ------------------------------ monitor ------------------------------- */

export type ContrastMonitorOptions = {
  win?: Window;
  /** Lazily loads axe-core; defaults to `import("axe-core")`. */
  loadAxe?: () => Promise<AxeLike>;
  isDev?: boolean;
  debounceMs?: number;
  warn?: (...args: unknown[]) => void;
};

export type ContrastMonitor = {
  /**
   * Starts watching. The monitor engages (loads axe, observes the DOM) as soon
   * as it is enabled, including when the theme switches to a light one later.
   * Resolves with whether it is engaged right now.
   */
  start(): Promise<boolean>;
  stop(): void;
  /** Runs one scan now (when engaged) and resolves with the newly found issues. */
  run(): Promise<ContrastIssue[]>;
};

const defaultLoadAxe = async (): Promise<AxeLike> => {
  const axe = await import("axe-core");
  return (axe.default ?? axe) as unknown as AxeLike;
};

function injectStyle(doc: Document) {
  if (doc.getElementById(CONTRAST_STYLE_ID)) return;

  const style = doc.createElement("style");
  style.id = CONTRAST_STYLE_ID;
  style.textContent = `[${CONTRAST_ATTRIBUTE}] { outline: 2px dashed var(--gn-state-danger, red) !important; outline-offset: -2px; }`;
  doc.head.appendChild(style);
}

export function createContrastMonitor(
  options: ContrastMonitorOptions = {},
): ContrastMonitor {
  const win = options.win ?? window;
  const doc = win.document;
  const isDev = options.isDev ?? process.env.NODE_ENV !== "production";
  const loadAxe = options.loadAxe ?? defaultLoadAxe;
  const debounceMs = options.debounceMs ?? 1500;
  const warn = options.warn ?? console.warn.bind(console);
  const MutationObserverCtor = (win as unknown as typeof globalThis)
    .MutationObserver;

  let reportedElements = new WeakSet<Element>();
  let reportedSignatures = new Set<string>();
  let axe: AxeLike | null = null;
  let axeLoaded = false;
  let themeObserver: MutationObserver | null = null;
  let domObserver: MutationObserver | null = null;
  let timer: number | null = null;
  let running = false;
  let rerun = false;
  let started = false;
  let engaged = false;
  let lastScheme: ColorScheme | null = null;

  function isEnabled(): boolean {
    let storage: Storage | null = null;
    try {
      storage = win.localStorage;
    } catch {
      storage = null;
    }

    return shouldEnableMonitor({
      isDev,
      preference: readMonitorPreference(storage),
      scheme: getActiveColorScheme(doc),
      defaultScheme: getDefaultColorScheme(),
    });
  }

  function clearOutlines() {
    doc.querySelectorAll(`[${CONTRAST_ATTRIBUTE}]`).forEach((element) => {
      element.removeAttribute(CONTRAST_ATTRIBUTE);
    });
    reportedElements = new WeakSet();
    reportedSignatures = new Set();
  }

  function report(issue: ContrastIssue) {
    reportedElements.add(issue.element);
    issue.element.setAttribute(CONTRAST_ATTRIBUTE, issue.kind);

    // The same component rendered in a list is warned about once.
    const signature = `${issue.kind}|${issue.hint}|${issue.message}`;
    if (reportedSignatures.has(signature)) return;
    reportedSignatures.add(signature);

    warn(`[gn-contrast] ${issue.message} in ${issue.hint}`, issue.element);
  }

  async function collect(): Promise<ContrastIssue[]> {
    const issues: ContrastIssue[] = [];

    if (axe) {
      const results = await axe.run(doc.body, {
        runOnly: { type: "rule", values: ["color-contrast"] },
        resultTypes: ["violations"],
        elementRef: true,
      });

      for (const violation of results.violations) {
        for (const node of violation.nodes) {
          const element = node.element;
          if (!element) continue;

          const data = node.any?.[0]?.data ?? {};
          const ratio =
            typeof data.contrastRatio === "number"
              ? `${data.contrastRatio.toFixed(2)}:1`
              : "low";
          const colors = `text ${String(data.fgColor ?? "?")} on ${String(data.bgColor ?? "?")}`;

          issues.push({
            kind: "text-contrast",
            element,
            hint: describeElement(element),
            message: `Low text contrast ${ratio} (${colors}).`,
          });
        }
      }
    }

    if (getActiveColorScheme(doc) === "light") {
      for (const element of findDarkBlocks(doc.body, win)) {
        issues.push({
          kind: "dark-block",
          element,
          hint: describeElement(element),
          message:
            "Solid dark block in a light theme (use a theme surface token, or ThemeScope/--gn-media-* for intentionally dark artwork).",
        });
      }
    }

    return issues;
  }

  async function run(): Promise<ContrastIssue[]> {
    if (!engaged) return [];

    if (running) {
      rerun = true;
      return [];
    }

    running = true;

    try {
      const fresh = (await collect()).filter(
        (issue) => !reportedElements.has(issue.element),
      );
      fresh.forEach(report);
      return fresh;
    } catch (error) {
      warn("[gn-contrast] scan failed", error);
      return [];
    } finally {
      running = false;

      if (rerun) {
        rerun = false;
        schedule();
      }
    }
  }

  function schedule() {
    if (!engaged) return;
    if (timer) win.clearTimeout(timer);

    timer = win.setTimeout(() => {
      timer = null;
      void run();
    }, debounceMs);
  }

  async function engage() {
    if (engaged) return;
    engaged = true;
    injectStyle(doc);

    if (!axeLoaded) {
      axeLoaded = true;

      try {
        axe = await loadAxe();
      } catch (error) {
        warn(
          "[gn-contrast] axe-core could not be loaded; only the dark-block check runs",
          error,
        );
      }
    }

    // The monitor may have been stopped or disabled while axe was loading.
    if (!engaged || !started) return;

    domObserver = new MutationObserverCtor(schedule);
    domObserver.observe(doc.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    win.addEventListener("popstate", schedule);
    schedule();
  }

  function disengage() {
    if (!engaged) return;
    engaged = false;
    domObserver?.disconnect();
    domObserver = null;
    if (timer) win.clearTimeout(timer);
    timer = null;
    win.removeEventListener("popstate", schedule);
    clearOutlines();
  }

  async function sync() {
    if (!started) return;

    const scheme = getActiveColorScheme(doc);
    if (lastScheme !== null && lastScheme !== scheme) clearOutlines();
    lastScheme = scheme;

    if (isEnabled()) await engage();
    else disengage();
  }

  const api: ContrastMonitor = {
    async start() {
      if (started) return engaged;
      started = true;

      // `data-theme` / Mantine's scheme change when the user switches theme.
      themeObserver = new MutationObserverCtor(() => void sync());
      themeObserver.observe(doc.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "data-mantine-color-scheme"],
      });
      (
        win as Window & { __gnContrastMonitor?: ContrastMonitor }
      ).__gnContrastMonitor = api;

      await sync();
      return engaged;
    },

    stop() {
      started = false;
      themeObserver?.disconnect();
      themeObserver = null;
      disengage();
      delete (win as Window & { __gnContrastMonitor?: ContrastMonitor })
        .__gnContrastMonitor;
    },

    run,
  };

  return api;
}
