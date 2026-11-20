// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const reveal = vi.fn(async () => {});
let native = true;

vi.mock("@capacitor/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@capacitor/core")>()),
  Capacitor: { isNativePlatform: () => native },
}));
vi.mock("@/plugins/entrySplash", () => ({
  EntrySplashNative: { reveal: () => reveal() },
}));

// The "already revealed" flag and the ready signal live in modules: every test loads fresh copies.
const loadSplash = async () => ({
  EntrySplash: (await import("./EntrySplash")).default,
  markAppReady: (await import("./appReady")).markAppReady,
  whenSplashDone: (await import("./appReady")).whenSplashDone,
});

describe("EntrySplash", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    reveal.mockClear();
    native = true;
    // frames every 16 ms on the fake clock
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

  it("reveals the native splash once the app has mounted and painted", async () => {
    const { EntrySplash, markAppReady } = await loadSplash();
    const { container } = render(<EntrySplash />);
    expect(container.innerHTML).toBe("");

    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(reveal).not.toHaveBeenCalled();

    act(() => markAppReady());
    // waits two animation frames, so the app's first frame is painted before the hole opens
    await act(() => vi.advanceTimersByTimeAsync(16));
    expect(reveal).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(16));
    expect(reveal).toHaveBeenCalledOnce();
  });

  it("reports the splash done once the native reveal resolves", async () => {
    const { EntrySplash, markAppReady, whenSplashDone } = await loadSplash();
    let finish: () => void = () => {};
    reveal.mockImplementationOnce(() => new Promise<void>((r) => (finish = r)));
    const done = vi.fn();
    whenSplashDone().then(done);
    render(<EntrySplash />);

    act(() => markAppReady());
    await act(() => vi.advanceTimersByTimeAsync(32));
    expect(reveal).toHaveBeenCalledOnce();
    expect(done).not.toHaveBeenCalled();

    await act(async () => finish());
    expect(done).toHaveBeenCalledOnce();
  });

  it("reveals anyway after 3 s if the app never reports ready", async () => {
    const { EntrySplash } = await loadSplash();
    render(<EntrySplash />);

    await act(() => vi.advanceTimersByTimeAsync(2900));
    expect(reveal).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(150));
    expect(reveal).toHaveBeenCalledOnce();
  });

  it("does not reveal a second time in the same launch", async () => {
    const { EntrySplash, markAppReady } = await loadSplash();
    const first = render(<EntrySplash />);
    act(() => markAppReady());
    await act(() => vi.advanceTimersByTimeAsync(100));
    first.unmount();

    render(<EntrySplash />);
    await act(() => vi.advanceTimersByTimeAsync(4000));
    expect(reveal).toHaveBeenCalledOnce();
  });

  it("does nothing outside the native app", async () => {
    native = false;
    const { EntrySplash, markAppReady } = await loadSplash();
    render(<EntrySplash />);
    act(() => markAppReady());
    await act(() => vi.advanceTimersByTimeAsync(4000));
    expect(reveal).not.toHaveBeenCalled();
  });
});
