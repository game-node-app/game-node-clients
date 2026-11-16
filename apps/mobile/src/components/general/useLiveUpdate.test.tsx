// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import {
  LiveUpdate,
  type DownloadBundleProgressEvent,
} from "@capawesome/capacitor-live-update";
import { useLiveUpdate } from "./useLiveUpdate";

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: vi.fn() },
}));
vi.mock("@capacitor/app", () => ({ App: { addListener: vi.fn() } }));
vi.mock("@capawesome/capacitor-live-update", () => ({
  LiveUpdate: {
    ready: vi.fn(),
    getCurrentBundle: vi.fn(),
    getNextBundle: vi.fn(),
    getDownloadedBundles: vi.fn(),
    downloadBundle: vi.fn(),
    setNextBundle: vi.fn(),
    reload: vi.fn(),
    addListener: vi.fn(),
  },
}));

const directory = `https://updates.example/ota/${__NATIVE_FINGERPRINT__}/`;
const manifest = {
  bundleId: "1.8.13-abc1234",
  url: `${directory}1.8.13-abc1234.zip`,
  checksum: "ab".repeat(32),
};
const removeApp = vi.fn();
const removeProgress = vi.fn();
let resume: () => void;
let progress: (event: DownloadBundleProgressEvent) => void;
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

beforeEach(() => {
  vi.resetAllMocks();
  removeApp.mockResolvedValue(undefined);
  removeProgress.mockResolvedValue(undefined);
  vi.stubEnv("VITE_PUBLIC_LIVE_UPDATE_URL", "https://updates.example/");
  vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
  vi.mocked(LiveUpdate.ready).mockResolvedValue({
    currentBundleId: null,
    previousBundleId: null,
    rollback: false,
  });
  vi.mocked(LiveUpdate.getCurrentBundle).mockResolvedValue({ bundleId: null });
  vi.mocked(LiveUpdate.getNextBundle).mockResolvedValue({ bundleId: null });
  vi.mocked(LiveUpdate.getDownloadedBundles).mockResolvedValue({
    bundleIds: [],
  });
  vi.mocked(LiveUpdate.addListener).mockImplementation(
    async (_event, callback) => {
      progress = callback as typeof progress;
      return { remove: removeProgress };
    },
  );
  vi.mocked(App.addListener).mockImplementation(async (_event, callback) => {
    resume = callback as () => void;
    return { remove: removeApp };
  });
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({ status: 200, ok: true, json: async () => manifest }),
  );
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("confirms readiness, verifies the manifest and stages without automatically reloading", async () => {
  const { result, unmount } = renderHook(useLiveUpdate);
  await waitFor(() => expect(result.current.state.status).toBe("ready"));
  expect(LiveUpdate.ready).toHaveBeenCalledOnce();
  expect(vi.mocked(LiveUpdate.ready).mock.invocationCallOrder[0]).toBeLessThan(
    vi.mocked(fetch).mock.invocationCallOrder[0]!,
  );
  expect(
    vi.mocked(LiveUpdate.addListener).mock.invocationCallOrder[0],
  ).toBeLessThan(
    vi.mocked(LiveUpdate.downloadBundle).mock.invocationCallOrder[0]!,
  );
  expect(fetch).toHaveBeenCalledWith(
    `${directory}latest.json`,
    expect.objectContaining({ cache: "no-store" }),
  );
  expect(LiveUpdate.downloadBundle).toHaveBeenCalledWith(manifest);
  expect(LiveUpdate.setNextBundle).toHaveBeenCalledWith({
    bundleId: manifest.bundleId,
  });
  expect(LiveUpdate.reload).not.toHaveBeenCalled();
  unmount();
  await waitFor(() => {
    expect(removeApp).toHaveBeenCalledOnce();
    expect(removeProgress).toHaveBeenCalledOnce();
  });
});

it("stays inactive on web", () => {
  vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
  const { result } = renderHook(useLiveUpdate);
  expect(result.current.state.status).toBe("idle");
  expect(LiveUpdate.ready).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});

it("tracks only this bundle's finite known progress and waits for staging after 100%", async () => {
  const download = deferred<void>();
  const stage = deferred<void>();
  vi.mocked(LiveUpdate.downloadBundle).mockReturnValue(download.promise);
  vi.mocked(LiveUpdate.setNextBundle).mockReturnValue(stage.promise);
  const { result } = renderHook(useLiveUpdate);
  await waitFor(() => expect(LiveUpdate.downloadBundle).toHaveBeenCalledOnce());
  const emitProgress = (
    value: number,
    bundleId = manifest.bundleId,
    totalBytes = 100,
  ) =>
    act(() =>
      progress({ bundleId, progress: value, downloadedBytes: 50, totalBytes }),
    );
  expect(result.current.state).toEqual({
    status: "downloading",
    progress: null,
  });
  emitProgress(0.5, "other");
  emitProgress(Number.NaN);
  emitProgress(0.5, manifest.bundleId, 0);
  expect(result.current.state).toEqual({
    status: "downloading",
    progress: null,
  });
  emitProgress(0.42);
  expect(result.current.state).toEqual({ status: "downloading", progress: 42 });
  emitProgress(2);
  expect(result.current.state).toEqual({
    status: "downloading",
    progress: 100,
  });
  await act(async () => download.resolve());
  expect(result.current.state.status).toBe("downloading");
  expect(LiveUpdate.reload).not.toHaveBeenCalled();
  await act(async () => stage.resolve());
  expect(result.current.state.status).toBe("ready");
});

it.each(["offline", "disabled"])(
  "restores an already staged update when %s",
  async (mode) => {
    vi.mocked(LiveUpdate.getNextBundle).mockResolvedValue({
      bundleId: manifest.bundleId,
    });
    if (mode === "disabled") vi.stubEnv("VITE_PUBLIC_LIVE_UPDATE_URL", "");
    else vi.mocked(fetch).mockRejectedValue(new Error("Offline"));
    const { result } = renderHook(useLiveUpdate);
    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    expect(fetch).not.toHaveBeenCalled();
    expect(LiveUpdate.downloadBundle).not.toHaveBeenCalled();
    act(() => result.current.dismiss());
    act(() => resume());
    expect(result.current.state.status).toBe("idle");
    expect(fetch).not.toHaveBeenCalled();
    expect(LiveUpdate.reload).not.toHaveBeenCalled();
  },
);

it("does not offer the active bundle and reuses an already downloaded bundle", async () => {
  vi.mocked(LiveUpdate.getCurrentBundle).mockResolvedValue({
    bundleId: manifest.bundleId,
  });
  const first = renderHook(useLiveUpdate);
  await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
  expect(first.result.current.state.status).toBe("idle");
  expect(LiveUpdate.downloadBundle).not.toHaveBeenCalled();
  first.unmount();
  vi.mocked(LiveUpdate.getCurrentBundle).mockResolvedValue({ bundleId: null });
  vi.mocked(LiveUpdate.getDownloadedBundles).mockResolvedValue({
    bundleIds: [manifest.bundleId],
  });
  const second = renderHook(useLiveUpdate);
  await waitFor(() => expect(second.result.current.state.status).toBe("ready"));
  expect(LiveUpdate.downloadBundle).not.toHaveBeenCalled();
  expect(LiveUpdate.setNextBundle).toHaveBeenCalledOnce();
});

it("restarts only on request, guards repeated clicks and allows retry after reload failure", async () => {
  const reload = deferred<void>();
  vi.mocked(LiveUpdate.reload).mockReturnValueOnce(reload.promise);
  const { result } = renderHook(useLiveUpdate);
  act(() => result.current.restart());
  expect(LiveUpdate.reload).not.toHaveBeenCalled();
  await waitFor(() => expect(result.current.state.status).toBe("ready"));
  act(() => {
    result.current.restart();
    result.current.restart();
    resume();
  });
  expect(result.current.state.status).toBe("restarting");
  expect(LiveUpdate.reload).toHaveBeenCalledOnce();
  await act(async () => reload.reject(new Error("Reload failed")));
  expect(result.current.state).toEqual({ status: "error", phase: "restart" });
  act(() => resume());
  expect(result.current.state).toEqual({ status: "error", phase: "restart" });
  act(() => result.current.retry());
  await waitFor(() => expect(LiveUpdate.reload).toHaveBeenCalledTimes(2));
  expect(LiveUpdate.downloadBundle).toHaveBeenCalledOnce();
});

it.each([
  { ...manifest, checksum: "invalid" },
  { ...manifest, bundleId: "../other" },
  { ...manifest, bundleId: "public" },
  { ...manifest, url: "http://updates.example/bundle.zip" },
  { ...manifest, url: "https://updates.example/ota/other/bundle.zip" },
  null,
])("rejects malformed or incompatible manifests: %j", async (value) => {
  vi.mocked(fetch).mockResolvedValue({
    status: 200,
    ok: true,
    json: async () => value,
  } as Response);
  const { result } = renderHook(useLiveUpdate);
  await waitFor(() => expect(console.error).toHaveBeenCalled());
  expect(result.current.state.status).toBe("idle");
  expect(LiveUpdate.downloadBundle).not.toHaveBeenCalled();
  expect(LiveUpdate.setNextBundle).not.toHaveBeenCalled();
});

it("logs offline manifest failures silently and retries on resume", async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new Error("Offline"));
  const { result } = renderHook(useLiveUpdate);
  await waitFor(() => expect(console.error).toHaveBeenCalled());
  expect(result.current.state.status).toBe("idle");
  act(() => resume());
  await waitFor(() => expect(result.current.state.status).toBe("ready"));
});

it.each(["download", "stage"])(
  "reports %s failures and retries safely",
  async (phase) => {
    if (phase === "download")
      vi.mocked(LiveUpdate.downloadBundle).mockRejectedValueOnce(
        new Error("Checksum mismatch"),
      );
    else
      vi.mocked(LiveUpdate.setNextBundle).mockRejectedValueOnce(
        new Error("Stage failed"),
      );
    const { result } = renderHook(useLiveUpdate);
    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "error",
        phase: "download",
      }),
    );
    expect(LiveUpdate.reload).not.toHaveBeenCalled();
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.state.status).toBe("ready"));
  },
);

it("ignores a missing manifest and retries on resume", async () => {
  vi.mocked(fetch).mockResolvedValueOnce({ status: 404 } as Response);
  const { result } = renderHook(useLiveUpdate);
  await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
  act(() => resume());
  await waitFor(() => expect(result.current.state.status).toBe("ready"));
  expect(console.error).not.toHaveBeenCalled();
});

it("prevents overlapping checks and staging after unmount", async () => {
  const download = deferred<void>();
  vi.mocked(LiveUpdate.downloadBundle).mockReturnValue(download.promise);
  const { unmount } = renderHook(useLiveUpdate);
  await waitFor(() => expect(LiveUpdate.downloadBundle).toHaveBeenCalledOnce());
  act(() => resume());
  expect(fetch).toHaveBeenCalledOnce();
  unmount();
  await act(async () => download.resolve());
  expect(LiveUpdate.setNextBundle).not.toHaveBeenCalled();
});

it("removes a listener registered after unmount and does not initialize further", async () => {
  const registration = deferred<{ remove: typeof removeProgress }>();
  vi.mocked(LiveUpdate.addListener).mockReturnValue(registration.promise);
  const { unmount } = renderHook(useLiveUpdate);
  await waitFor(() => expect(LiveUpdate.addListener).toHaveBeenCalledOnce());
  unmount();
  await act(async () => registration.resolve({ remove: removeProgress }));
  expect(removeProgress).toHaveBeenCalledOnce();
  expect(App.addListener).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});
