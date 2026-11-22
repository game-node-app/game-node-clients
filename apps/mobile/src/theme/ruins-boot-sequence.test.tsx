// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "../../../../packages/locales/src/translations/json/en.json";
import {
  getLocalDateString,
  RUINS_BOOT_LAST_STORAGE_KEY,
  RUINS_PREFERENCES_STORAGE_KEY,
} from "../../../../packages/ui/src/theme/ruins/preferences";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import {
  RuinsBootSequence,
  resetRuinsBootSequenceForTests,
} from "../../../../packages/ui/src/theme/themes/ruins/screens/overlay/RuinsBootSequence";

/*
 * `t` resolves against the real en.json and throws on a missing key, so the
 * boot labels can never drift from the locale files.
 */
vi.mock("@repo/locales", () => {
  const t = (key: string, options?: Record<string, string | number>) => {
    const value = key
      .split(".")
      .reduce<unknown>(
        (node, part) => (node as Record<string, unknown> | undefined)?.[part],
        en,
      );
    if (typeof value !== "string") throw new Error(`Missing key ${key}`);
    return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
      String(options?.[name] ?? ""),
    );
  };
  return { useTranslation: () => ({ t }) };
});

const session = vi.hoisted(() => ({
  value: {
    data: { user: { id: "u1" } } as { user: { id: string } } | null,
    isPending: false,
  },
}));
vi.mock("../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => session.value },
}));

const LOG = '[data-slot="ruins-boot-log"]';
const ROOT = '[data-slot="ruins-boot"]';

let queryClient: QueryClient;

/** Renders and lets the post-effect mount (a microtask) settle. */
async function mount() {
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RuinsBootSequence />
    </QueryClientProvider>,
  );
  await act(async () => {});
  return view;
}

async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

function setPreferences(bootAnimation: "always" | "daily" | "never") {
  localStorage.setItem(
    RUINS_PREFERENCES_STORAGE_KEY,
    JSON.stringify({ bootAnimation }),
  );
}

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: matches && query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

/** Stands in for the mobile `useEntrySplashDone` hook (native splash gone). */
const entrySplash = vi.hoisted(() => ({
  done: false,
  listeners: new Set<() => void>(),
}));

function useTestEntrySplashDone() {
  return useSyncExternalStore(
    (listener) => {
      entrySplash.listeners.add(listener);
      return () => entrySplash.listeners.delete(listener);
    },
    () => entrySplash.done,
  );
}

const SPLASH_HOOKS = {
  useRouter: () => ({
    back: () => {},
    pathname: "",
    push: async () => {},
    query: new URLSearchParams(),
  }),
  useEntrySplashDone: useTestEntrySplashDone,
};

async function finishEntrySplash() {
  await act(async () => {
    entrySplash.done = true;
    entrySplash.listeners.forEach((listener) => listener());
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  entrySplash.done = false;
  resetRuinsBootSequenceForTests();
  mockReducedMotion(false);
  session.value = { data: { user: { id: "u1" } }, isPending: false };
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("RuinsBootSequence", () => {
  it("plays the timeline and unmounts by ~2.2s", async () => {
    setPreferences("always");
    const { container } = await mount();
    await advance(1);

    const root = container.ownerDocument.querySelector(ROOT);
    expect(root).not.toBeNull();
    expect(root?.getAttribute("data-stage")).toBe("1");

    await advance(500);
    expect(root?.getAttribute("data-stage")).toBe("2");
    expect(container.ownerDocument.querySelector(LOG)).not.toBeNull();

    await advance(1100); // 1.6s: lockup
    expect(
      container.ownerDocument.querySelector('[data-slot="ruins-boot-lockup"]'),
    ).not.toBeNull();

    await advance(700);
    expect(container.ownerDocument.querySelector(ROOT)).toBeNull();
    expect(localStorage.getItem(RUINS_BOOT_LAST_STORAGE_KEY)).toBe(
      getLocalDateString(),
    );
  });

  describe("with an entry splash (native mobile)", () => {
    async function mountBehindSplash() {
      const view = render(
        <QueryClientProvider client={queryClient}>
          <UIProvider hooks={SPLASH_HOOKS}>
            <RuinsBootSequence />
          </UIProvider>
        </QueryClientProvider>,
      );
      await act(async () => {});
      return view;
    }

    it("holds the paper first frame and starts the timeline once the splash is done", async () => {
      setPreferences("always");
      const { container } = await mountBehindSplash();
      const doc = container.ownerDocument;

      // covered by the paper background, but no boot content or timeline yet
      await advance(5000);
      expect(
        doc.querySelector('[data-slot="ruins-boot-waiting"]'),
      ).not.toBeNull();
      expect(doc.querySelector(ROOT)).toBeNull();
      expect(doc.querySelector(LOG)).toBeNull();

      await finishEntrySplash();
      await advance(1);
      expect(doc.querySelector('[data-slot="ruins-boot-waiting"]')).toBeNull();
      expect(doc.querySelector(ROOT)?.getAttribute("data-stage")).toBe("1");

      // the timeline ran from the splash hand-off, not from mount
      await advance(500);
      expect(doc.querySelector(ROOT)?.getAttribute("data-stage")).toBe("2");
      await advance(1800);
      expect(doc.querySelector(ROOT)).toBeNull();
    });

    it("does not consume the daily cadence or show anything when the boot is off", async () => {
      setPreferences("never");
      const { container } = await mountBehindSplash();
      await advance(50);
      expect(
        container.ownerDocument.querySelector(
          '[data-slot="ruins-boot-waiting"]',
        ),
      ).toBeNull();
      await finishEntrySplash();
      expect(container.ownerDocument.querySelector(ROOT)).toBeNull();
    });

    it("waits for the splash before the reduced-motion hold", async () => {
      setPreferences("always");
      mockReducedMotion(true);
      const { container } = await mountBehindSplash();
      const doc = container.ownerDocument;

      await advance(2000);
      expect(
        doc.querySelector('[data-slot="ruins-boot-waiting"]'),
      ).not.toBeNull();

      await finishEntrySplash();
      await advance(1);
      expect(
        doc.querySelector('[data-slot="ruins-boot-lockup"]'),
      ).not.toBeNull();
      await advance(450);
      expect(doc.querySelector(ROOT)).toBeNull();
    });
  });

  it("skips with Escape and swallows Enter", async () => {
    setPreferences("always");
    const { container } = await mount();
    await advance(300);
    expect(container.ownerDocument.querySelector(ROOT)).not.toBeNull();

    const enter = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    await act(async () => {
      window.dispatchEvent(enter);
    });
    expect(enter.defaultPrevented).toBe(true);
    expect(container.ownerDocument.querySelector(ROOT)).toBeNull();
  });

  it("skips with Escape", async () => {
    setPreferences("always");
    const { container } = await mount();
    await advance(300);
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(container.ownerDocument.querySelector(ROOT)).toBeNull();
  });

  it("skips with a tap or click", async () => {
    setPreferences("always");
    const { container } = await mount();
    await advance(300);
    fireEvent.pointerDown(container.ownerDocument.querySelector(ROOT)!);
    expect(container.ownerDocument.querySelector(ROOT)).toBeNull();
  });

  it("does not run when the option is never", async () => {
    setPreferences("never");
    const { container } = await mount();
    await advance(50);
    expect(container.ownerDocument.querySelector(ROOT)).toBeNull();
    expect(localStorage.getItem(RUINS_BOOT_LAST_STORAGE_KEY)).toBeNull();
  });

  it("does not run twice on the same day with daily, and runs on a new day", async () => {
    setPreferences("daily");
    localStorage.setItem(RUINS_BOOT_LAST_STORAGE_KEY, getLocalDateString());
    const first = await mount();
    await advance(50);
    expect(first.container.ownerDocument.querySelector(ROOT)).toBeNull();
    first.unmount();

    resetRuinsBootSequenceForTests();
    localStorage.setItem(RUINS_BOOT_LAST_STORAGE_KEY, "2000-01-01");
    const second = await mount();
    await advance(50);
    expect(second.container.ownerDocument.querySelector(ROOT)).not.toBeNull();
  });

  it("runs at most once per app lifetime", async () => {
    setPreferences("always");
    const first = await mount();
    await advance(50);
    expect(first.container.ownerDocument.querySelector(ROOT)).not.toBeNull();
    await advance(2300);
    first.unmount();

    const second = await mount();
    await advance(50);
    expect(second.container.ownerDocument.querySelector(ROOT)).toBeNull();
  });

  it("shows a static lockup for 400ms under reduced motion", async () => {
    setPreferences("always");
    mockReducedMotion(true);
    const { container } = await mount();
    await advance(1);

    const doc = container.ownerDocument;
    expect(doc.querySelector('[data-slot="ruins-boot-lockup"]')).not.toBeNull();
    expect(doc.querySelector(LOG)).toBeNull();

    await advance(300);
    expect(doc.querySelector(ROOT)).not.toBeNull();
    await advance(150);
    expect(doc.querySelector(ROOT)).toBeNull();
  });

  it("marks lines PENDING when the cache is empty", async () => {
    setPreferences("always");
    const { container } = await mount();
    await advance(900);

    const doc = container.ownerDocument;
    const status = (id: string) =>
      doc.querySelector(`[data-line="${id}"] [data-status]`);
    expect(status("level")?.textContent).toBe("PENDING");
    expect(status("library")?.textContent).toBe("PENDING");
    expect(status("connections")?.textContent).toBe("PENDING");
    expect(status("memory")?.textContent).toBe("OK");
    expect(queryClient.isFetching()).toBe(0);
  });

  it("shows real values already in the query cache", async () => {
    setPreferences("always");
    queryClient.setQueryData(["user-level", "u1"], {
      currentLevel: 12,
      currentLevelExp: 2480,
      levelUpExpCost: 3000,
    });
    queryClient.setQueryData(["profile", "metrics", "u1", "u1"], {
      totalGames: 128,
      totalCollections: 9,
    });
    queryClient.setQueryData(["userProfile", "u1", "u1"], {
      username: "ThePrado",
    });
    queryClient.setQueryData(
      ["connections", "user", "u1"],
      [
        { type: "steam", authStatus: "connected" },
        { type: "psn", authStatus: "reauth_required" },
      ],
    );
    queryClient.setQueryData(["recap", "goals", 2026, "u1"], {
      year: 2026,
      target: 24,
      finished: 18,
    });
    queryClient.setQueryData(
      ["notifications", "aggregated", "infinite", "u1", "all"],
      {
        pages: [{ unreadCount: 3, data: [] }],
        pageParams: [undefined],
      },
    );
    queryClient.setQueryData(["awards", "event", "current"], {
      year: 2026,
      phase: "voting",
    });

    const { container } = await mount();
    await advance(900);

    const doc = container.ownerDocument;
    const line = (id: string) => doc.querySelector(`[data-line="${id}"]`);
    expect(line("unit")?.textContent).toContain("unit: ThePrado");
    expect(line("level")?.textContent).toContain("level 12 · 2,480 XP");
    expect(line("level")?.textContent).toContain("SYNC");
    expect(line("library")?.textContent).toContain("library: 128 games");
    expect(line("collections")?.textContent).toContain("collections: 9");
    expect(line("connections")?.textContent).toContain("STEAM·PSN");
    expect(line("connections")?.textContent).toContain("1/2");
    expect(line("goal")?.textContent).toContain("75%");
    expect(line("notifications")?.textContent).toContain("3");
    expect(line("awards")?.textContent).toContain("OPEN");
    expect(line("daily")?.querySelector("[data-status]")?.textContent).toBe(
      "PENDING",
    );
  });

  it("shows OFFLINE for connections while the browser is offline", async () => {
    setPreferences("always");
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    const { container } = await mount();
    await advance(900);

    expect(
      container.ownerDocument.querySelector(
        '[data-line="connections"] [data-status]',
      )?.textContent,
    ).toBe("OFFLINE");
  });

  it("hides the log from assistive tech and announces the load", async () => {
    setPreferences("always");
    const { container } = await mount();
    await advance(100);

    const doc = container.ownerDocument;
    const log = doc.querySelector(LOG);
    expect(log?.closest('[aria-hidden="true"]')).not.toBeNull();
    const live = doc.querySelector('[role="status"]');
    expect(live?.getAttribute("aria-hidden")).toBeNull();
    expect(live?.textContent).toBe("GameNode loaded");
  });

  it("renders nothing on the server", () => {
    setPreferences("always");
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <RuinsBootSequence />
      </QueryClientProvider>,
    );
    expect(html).toBe("");
  });
});
