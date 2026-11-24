// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONTRAST_ATTRIBUTE,
  CONTRAST_MONITOR_STORAGE_KEY,
  createContrastMonitor,
  describeElement,
  findDarkBlocks,
  getActiveColorScheme,
  parseCssColor,
  readMonitorPreference,
  relativeLuminance,
  shouldEnableMonitor,
  type AxeLike,
} from "../../../../packages/ui/src/theme/dev/contrastMonitorCore";

function setTheme(themeId: string) {
  document.documentElement.setAttribute("data-theme", themeId);
}

function mockAxe(element: Element | null) {
  const run = vi.fn(async () => ({
    violations: element
      ? [
          {
            id: "color-contrast",
            nodes: [
              {
                element,
                any: [
                  {
                    data: {
                      contrastRatio: 1.8,
                      fgColor: "#aaaaaa",
                      bgColor: "#ffffff",
                    },
                  },
                ],
              },
            ],
          },
        ]
      : [],
  }));
  const loadAxe = vi.fn(async () => ({ run }) as unknown as AxeLike);

  return { run, loadAxe };
}

describe("shouldEnableMonitor", () => {
  const base = {
    isDev: true,
    preference: null,
    scheme: "light",
    defaultScheme: "dark",
  } as const;

  it("is on by default only when the scheme differs from the default theme's", () => {
    expect(shouldEnableMonitor(base)).toBe(true);
    expect(shouldEnableMonitor({ ...base, scheme: "dark" })).toBe(false);
  });

  it("lets localStorage force it on or off", () => {
    expect(
      shouldEnableMonitor({ ...base, scheme: "dark", preference: "on" }),
    ).toBe(true);
    expect(shouldEnableMonitor({ ...base, preference: "off" })).toBe(false);
  });

  it("is never on in production", () => {
    expect(
      shouldEnableMonitor({ ...base, isDev: false, preference: "on" }),
    ).toBe(false);
  });
});

describe("readMonitorPreference", () => {
  it("accepts on/off and ignores anything else or a throwing storage", () => {
    const get = (value: string | null) => ({ getItem: () => value });

    expect(readMonitorPreference(get("on"))).toBe("on");
    expect(readMonitorPreference(get("off"))).toBe("off");
    expect(readMonitorPreference(get("maybe"))).toBeNull();
    expect(readMonitorPreference(get(null))).toBeNull();
    expect(readMonitorPreference(null)).toBeNull();
    expect(
      readMonitorPreference({
        getItem: () => {
          throw new Error("blocked");
        },
      }),
    ).toBeNull();
  });
});

describe("color helpers", () => {
  it("parses computed colors and measures luminance", () => {
    expect(parseCssColor("rgb(10, 20, 30)")).toEqual({
      r: 10,
      g: 20,
      b: 30,
      a: 1,
    });
    expect(parseCssColor("rgba(0, 0, 0, 0.5)")?.a).toBe(0.5);
    expect(parseCssColor("color(srgb 1 0 0 / 50%)")).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    });
    expect(parseCssColor("oklch(0.5 0.1 20)")).toBeNull();
    expect(relativeLuminance({ r: 0, g: 0, b: 0, a: 1 })).toBe(0);
    expect(relativeLuminance({ r: 255, g: 255, b: 255, a: 1 })).toBeCloseTo(1);
  });

  it("describes elements with the nearest component hint", () => {
    document.body.innerHTML = `<section data-slot="trending-hero"><div class="p-4 text-sm"><span id="x" class="a"></span></div></section>`;

    expect(describeElement(document.getElementById("x")!)).toBe(
      'span#x.a in [data-slot="trending-hero"]',
    );

    document.body.innerHTML = `<div class="Hero_card__x1y2z">a</div>`;
    expect(describeElement(document.body.firstElementChild!)).toContain(
      ".Hero_card__x1y2z",
    );
  });
});

describe("findDarkBlocks", () => {
  beforeEach(() => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      width: 400,
      height: 200,
      top: 0,
      left: 0,
      right: 400,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON() {},
    } as DOMRect);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports large opaque near-black blocks and skips scopes, artwork, media and light blocks", () => {
    document.body.innerHTML = `
      <div id="dark" style="background-color: rgb(5, 5, 5)"><p id="child" style="background-color: rgb(0, 0, 0)">x</p></div>
      <div id="light" style="background-color: rgb(240, 240, 240)"></div>
      <div id="scrim" style="background-color: rgba(0, 0, 0, 0.5)"></div>
      <div data-gn-scope="dark"><div id="scoped" style="background-color: rgb(0, 0, 0)"></div></div>
      <div data-gn-artwork><div id="artwork" style="background-color: rgb(0, 0, 0)"></div></div>
      <img id="media" style="background-color: rgb(0, 0, 0)" />
      <div id="art" style="background-color: rgb(0, 0, 0); background-image: url(cover.png)"></div>
    `;

    const ids = findDarkBlocks(document.body, window).map(
      (element) => element.id,
    );

    expect(ids).toEqual(["dark"]);
  });
});

describe("createContrastMonitor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `<div id="offender" data-slot="hero">Hello</div>`;
    window.localStorage.removeItem(CONTRAST_MONITOR_STORAGE_KEY);
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      width: 0,
      height: 0,
    } as DOMRect);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.documentElement.removeAttribute("data-theme");
  });

  it("stays off, and never loads axe, under the default dark theme", async () => {
    setTheme("gamenode");
    const { loadAxe } = mockAxe(null);
    const monitor = createContrastMonitor({ loadAxe, isDev: true });

    expect(await monitor.start()).toBe(false);
    expect(loadAxe).not.toHaveBeenCalled();
    monitor.stop();
  });

  it("stays off in production even when forced on", async () => {
    setTheme("ruins");
    window.localStorage.setItem(CONTRAST_MONITOR_STORAGE_KEY, "on");
    const { loadAxe } = mockAxe(null);
    const monitor = createContrastMonitor({ loadAxe, isDev: false });

    expect(await monitor.start()).toBe(false);
    expect(loadAxe).not.toHaveBeenCalled();
    monitor.stop();
  });

  it("warns once per offender and outlines it under a light theme", async () => {
    setTheme("ruins");
    expect(getActiveColorScheme(document)).toBe("light");

    const element = document.getElementById("offender")!;
    const { run, loadAxe } = mockAxe(element);
    const warn = vi.fn();
    const monitor = createContrastMonitor({
      loadAxe,
      warn,
      isDev: true,
      debounceMs: 50,
    });

    expect(await monitor.start()).toBe(true);
    expect(loadAxe).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(60);

    expect(run).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("1.80:1");
    expect(warn.mock.calls[0]![0]).toContain('[data-slot="hero"]');
    expect(element.getAttribute(CONTRAST_ATTRIBUTE)).toBe("text-contrast");
    expect(document.getElementById("gn-contrast-monitor-style")).not.toBeNull();

    // A new scan finds the same element: no duplicate report.
    const issues = await monitor.run();
    expect(issues).toHaveLength(0);
    expect(warn).toHaveBeenCalledTimes(1);

    monitor.stop();
    expect(element.hasAttribute(CONTRAST_ATTRIBUTE)).toBe(false);
  });

  it("can be forced on under the default theme and re-scans on DOM mutations", async () => {
    setTheme("gamenode");
    window.localStorage.setItem(CONTRAST_MONITOR_STORAGE_KEY, "on");
    const { run, loadAxe } = mockAxe(null);
    const monitor = createContrastMonitor({
      loadAxe,
      warn: vi.fn(),
      isDev: true,
      debounceMs: 50,
    });

    expect(await monitor.start()).toBe(true);
    await vi.advanceTimersByTimeAsync(60);
    expect(run).toHaveBeenCalledTimes(1);

    document.body.appendChild(document.createElement("div"));
    await vi.advanceTimersByTimeAsync(10);
    await vi.advanceTimersByTimeAsync(60);
    expect(run).toHaveBeenCalledTimes(2);
    monitor.stop();
  });

  it("engages when the theme switches to a light one later", async () => {
    setTheme("gamenode");
    const { loadAxe } = mockAxe(null);
    const monitor = createContrastMonitor({
      loadAxe,
      warn: vi.fn(),
      isDev: true,
      debounceMs: 50,
    });

    expect(await monitor.start()).toBe(false);

    setTheme("ruins");
    await vi.advanceTimersByTimeAsync(10);

    expect(loadAxe).toHaveBeenCalledTimes(1);
    monitor.stop();
  });
});
