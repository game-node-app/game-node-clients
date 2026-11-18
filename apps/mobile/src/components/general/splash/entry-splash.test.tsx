// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const phaseOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".gn-entry-splash")?.dataset.phase;

const mockReducedMotion = (reduced: boolean) =>
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: reduced,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );

// The "already shown" flag lives in the module, so every test loads a fresh copy.
const loadSplash = async () => (await import("./EntrySplash")).default;

describe("EntrySplash", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    mockReducedMotion(false);
    // frames every 16 ms on the fake clock, so the calm-frames wait is deterministic
    vi.stubGlobal("requestAnimationFrame", (cb: (time: number) => void) =>
      setTimeout(() => cb(Date.now()), 16),
    );
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("pulses, fills, zooms, fades and then unmounts", async () => {
    const EntrySplash = await loadSplash();
    const { container } = render(<EntrySplash />);
    expect(phaseOf(container)).toBe("pulse");

    // Holds the pulse for at least 1.2 s even though the page is already loaded.
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(phaseOf(container)).toBe("pulse");

    await act(() => vi.advanceTimersByTimeAsync(450));
    expect(phaseOf(container)).toBe("fill");

    await act(() => vi.advanceTimersByTimeAsync(650));
    expect(phaseOf(container)).toBe("zoom");

    // The page poll ticks every 150 ms (ready at 1.2 s), then six calm 16 ms frames start the
    // fill at about 1.3 s: the zoom ends at about 2.85 s.
    await act(() => vi.advanceTimersByTimeAsync(800));
    expect(phaseOf(container)).toBe("fade");

    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(container.querySelector(".gn-entry-splash")).toBeNull();
  });

  it("only blocks touches while the logo is pulsing", async () => {
    const EntrySplash = await loadSplash();
    const { container } = render(<EntrySplash />);
    const css = container.querySelector("style")!.textContent!;
    expect(css).toContain(".gn-entry-splash:not([data-phase=pulse])");
    expect(css).toContain("pointer-events: none");
  });

  it("skips straight to the fade with reduced motion", async () => {
    mockReducedMotion(true);
    const EntrySplash = await loadSplash();
    const { container } = render(<EntrySplash />);

    await act(() => vi.advanceTimersByTimeAsync(1350));
    expect(phaseOf(container)).toBe("fade");
  });

  it("does not play a second time in the same launch", async () => {
    const EntrySplash = await loadSplash();
    const first = render(<EntrySplash />);
    await act(() => vi.advanceTimersByTimeAsync(3500));
    expect(first.container.querySelector(".gn-entry-splash")).toBeNull();
    first.unmount();

    const second = render(<EntrySplash />);
    expect(second.container.querySelector(".gn-entry-splash")).toBeNull();
  });
});
