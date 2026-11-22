// @vitest-environment jsdom
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render } from "@testing-library/react";
import { createElement, type ComponentType, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import RuinsScreenPackStyles from "../../../../packages/ui/src/theme/packs/anchors/ruinsScreens";
import { RUINS_PREFERENCES_STORAGE_KEY } from "../../../../packages/ui/src/theme/ruins/preferences";
import styles from "../../../../packages/ui/src/theme/themes/ruins/screens/RuinsPrimitives.module.css";
import {
  PRIMITIVES_ANCHOR_CLASS,
  shell,
} from "../../../../packages/ui/src/theme/themes/ruins/screens";
import { RuinsOverlay } from "../../../../packages/ui/src/theme/themes/ruins/screens/overlay/RuinsOverlay";

/**
 * Bundle guard for `RuinsPrimitives.module.css`.
 *
 * The stylesheet is almost entirely `:global(...)` side effects scoped to
 * `:root[data-theme="ruins"]`. Its only local export is `.primitivesAnchor`,
 * and a bare `import "./RuinsPrimitives.module.css"` exports nothing: Vite and
 * Rollup treated the module as unused and dropped the whole file from the
 * production build, so the Ruins theme shipped without its primitives.
 *
 * The anchor is the fix: the overlay renders `styles.primitivesAnchor`, the
 * pack entry re-exports it as `PRIMITIVES_ANCHOR_CLASS`, and the Next anchor
 * component applies it. This test pins all four links of that chain (three
 * static, one rendered) so the stylesheet cannot silently disappear again.
 */

/**
 * Repository file lookup that works from `apps/mobile` (pnpm/turbo) and from
 * any directory: Vite rewrites `import.meta.url` to a `/@fs/` URL in jsdom.
 */
function findRepoFile(relativePath: string): string {
  let directory = dirname(
    decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/@fs/, ""),
  );

  for (let depth = 0; depth < 10; depth += 1) {
    const candidate = join(directory, relativePath);
    if (existsSync(candidate)) return candidate;

    const parent = dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }

  throw new Error(`Cannot find ${relativePath} from ${import.meta.url}`);
}

function readRepoFile(relativePath: string): string {
  return readFileSync(findRepoFile(relativePath), "utf8");
}

const PRIMITIVES_CSS_PATH =
  "packages/ui/src/theme/themes/ruins/screens/RuinsPrimitives.module.css";
const OVERLAY_PATH =
  "packages/ui/src/theme/themes/ruins/screens/overlay/RuinsOverlay.tsx";
const PACK_ENTRY_PATH = "packages/ui/src/theme/themes/ruins/screens/index.ts";
const NEXT_ANCHOR_PATH = "packages/ui/src/theme/packs/anchors/ruinsScreens.tsx";

/** A bare side-effect import exports nothing and is exactly the old bug. */
const SIDE_EFFECT_IMPORT =
  /^\s*import\s+["'][^"']*RuinsPrimitives\.module\.css["'];?/m;

vi.mock("../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
  },
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
    i18n: { language: "en", resolvedLanguage: "en" },
  }),
}));

function Providers({ children }: { children?: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return createElement(
    QueryClientProvider,
    { client },
    createElement(
      // The `.ts` test cannot use JSX, so pass `children` as an argument; the
      // cast only makes it optional for `UIProvider`'s props type.
      UIProvider as unknown as ComponentType<{
        hooks: { useRouter: () => never };
        children?: ReactNode;
      }>,
      { hooks: { useRouter: () => ({}) as never } },
      children,
    ),
  );
}

function renderInProviders(ui: ReactNode) {
  return render(createElement(Providers, null, ui));
}

beforeEach(() => {
  // No boot animation: the overlay only has to mount its anchor here.
  window.localStorage.clear();
  window.localStorage.setItem(
    RUINS_PREFERENCES_STORAGE_KEY,
    JSON.stringify({
      bootAnimation: "never",
      paperTexture: false,
      scanline: false,
    }),
  );

  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("Ruins primitives stylesheet", () => {
  it("defines the anchor as a real local CSS Module class", () => {
    const css = readRepoFile(PRIMITIVES_CSS_PATH);

    // A local (not `:global`) class is what the bundler can see being used.
    const anchor = /^\.primitivesAnchor\s*\{([^}]*)\}/m.exec(css);
    expect(
      anchor,
      `${PRIMITIVES_CSS_PATH} must define .primitivesAnchor`,
    ).not.toBeNull();
    expect(anchor![1]).toMatch(/display:\s*none/);

    // Everything else stays a `:global` side effect scoped to the theme, so
    // the file cannot leak styles into other themes.
    const globalRules = css.match(/^\s*:global\(/gm)?.length ?? 0;
    expect(globalRules).toBeGreaterThan(50);
    expect(css).toContain(':global(:root[data-theme="ruins"])');
  });

  it("renders the anchor from the overlay instead of a bare side-effect import", () => {
    const overlay = readRepoFile(OVERLAY_PATH);

    expect(overlay).toMatch(
      /import\s+styles\s+from\s+["']\.\.\/RuinsPrimitives\.module\.css["']/,
    );
    expect(overlay).toContain("styles.primitivesAnchor");
    expect(overlay).toContain('data-slot="ruins-primitives-anchor"');
    expect(overlay).toMatch(/hidden/);
    expect(overlay).toMatch(/aria-hidden/);
    expect(overlay).not.toMatch(SIDE_EFFECT_IMPORT);
  });

  it("exports the anchor class from the lazy pack entry and keeps the pack wired", () => {
    const entry = readRepoFile(PACK_ENTRY_PATH);

    expect(entry).toMatch(
      /import\s+styles\s+from\s+["']\.\/RuinsPrimitives\.module\.css["']/,
    );
    expect(entry).toMatch(
      /export\s+const\s+PRIMITIVES_ANCHOR_CLASS\s*=\s*styles\.primitivesAnchor/,
    );
    expect(entry).not.toMatch(SIDE_EFFECT_IMPORT);

    // The pack entry must be the overlay the app actually renders.
    expect(shell.overlay).toBe(RuinsOverlay);
  });

  it("applies the exported class in the Next pack anchor", () => {
    const anchor = readRepoFile(NEXT_ANCHOR_PATH);

    expect(anchor).toContain("PRIMITIVES_ANCHOR_CLASS");
    expect(anchor).toMatch(/className=\{PRIMITIVES_ANCHOR_CLASS\}/);
    expect(anchor).not.toMatch(SIDE_EFFECT_IMPORT);
  });

  it("mounts the anchor in the DOM when the overlay renders", () => {
    const { container } = renderInProviders(createElement(RuinsOverlay));

    const anchor = container.querySelector(
      '[data-slot="ruins-primitives-anchor"]',
    );
    expect(
      anchor,
      "RuinsOverlay must mount its primitives anchor",
    ).not.toBeNull();
    expect(anchor!.hasAttribute("hidden")).toBe(true);
    expect(anchor!.getAttribute("aria-hidden")).toBe("true");

    // With CSS Modules enabled (Vite/Next), the element carries the class that
    // keeps the stylesheet in the module graph.
    if (PRIMITIVES_ANCHOR_CLASS) {
      expect(anchor!.getAttribute("class")).toBe(PRIMITIVES_ANCHOR_CLASS);
      expect(String(styles.primitivesAnchor)).toBe(PRIMITIVES_ANCHOR_CLASS);
    }
  });

  it("mounts the Next pack anchor with the same class", () => {
    const { container } = renderInProviders(
      createElement(RuinsScreenPackStyles),
    );

    const anchor = container.querySelector('[data-theme-pack="ruins-screens"]');
    expect(anchor).not.toBeNull();
    expect(anchor!.hasAttribute("hidden")).toBe(true);
    expect(anchor!.getAttribute("aria-hidden")).toBe("true");

    if (PRIMITIVES_ANCHOR_CLASS) {
      expect(anchor!.getAttribute("class")).toBe(PRIMITIVES_ANCHOR_CLASS);
    }
  });
});
