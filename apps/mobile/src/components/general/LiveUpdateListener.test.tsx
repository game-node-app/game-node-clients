// @vitest-environment jsdom
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { LiveUpdate } from "@capawesome/capacitor-live-update";
import LiveUpdateListener from "./LiveUpdateListener";

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
  },
}));

const directory = `https://updates.example/ota/${__NATIVE_FINGERPRINT__}/`;
const manifest = {
  bundleId: "1.8.13-abc1234",
  url: `${directory}1.8.13-abc1234.zip`,
  checksum: "ab".repeat(32),
};
const remove = vi.fn();
let resume: () => void;

beforeEach(() => {
  vi.resetAllMocks();
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
  vi.mocked(App.addListener).mockImplementation(async (_event, callback) => {
    resume = callback as () => void;
    return { remove };
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

it("confirms readiness before checking and passes the hex checksum to Android without reloading", async () => {
  const { unmount } = render(<LiveUpdateListener />);
  await waitFor(() =>
    expect(LiveUpdate.setNextBundle).toHaveBeenCalledWith({
      bundleId: manifest.bundleId,
    }),
  );
  expect(LiveUpdate.ready).toHaveBeenCalledOnce();
  expect(vi.mocked(LiveUpdate.ready).mock.invocationCallOrder[0]).toBeLessThan(
    vi.mocked(fetch).mock.invocationCallOrder[0]!,
  );
  expect(fetch).toHaveBeenCalledWith(
    `${directory}latest.json`,
    expect.objectContaining({ cache: "no-store" }),
  );
  expect(LiveUpdate.downloadBundle).toHaveBeenCalledWith(manifest);
  resume();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  unmount();
  await waitFor(() => expect(remove).toHaveBeenCalledOnce());
});

it("does nothing on web platforms", async () => {
  vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
  render(<LiveUpdateListener />);
  expect(LiveUpdate.ready).not.toHaveBeenCalled();
  expect(App.addListener).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});

it.each(["current", "next", "downloaded"])(
  "reuses the %s bundle",
  async (location) => {
    if (location === "current")
      vi.mocked(LiveUpdate.getCurrentBundle).mockResolvedValue({
        bundleId: manifest.bundleId,
      });
    if (location === "next")
      vi.mocked(LiveUpdate.getNextBundle).mockResolvedValue({
        bundleId: manifest.bundleId,
      });
    if (location === "downloaded")
      vi.mocked(LiveUpdate.getDownloadedBundles).mockResolvedValue({
        bundleIds: [manifest.bundleId],
      });
    render(<LiveUpdateListener />);
    await waitFor(() =>
      expect(
        location === "downloaded"
          ? LiveUpdate.setNextBundle
          : LiveUpdate.getNextBundle,
      ).toHaveBeenCalled(),
    );
    expect(LiveUpdate.downloadBundle).not.toHaveBeenCalled();
    if (location !== "downloaded")
      expect(LiveUpdate.setNextBundle).not.toHaveBeenCalled();
  },
);

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
  render(<LiveUpdateListener />);
  await waitFor(() => expect(console.error).toHaveBeenCalled());
  expect(LiveUpdate.downloadBundle).not.toHaveBeenCalled();
  expect(LiveUpdate.setNextBundle).not.toHaveBeenCalled();
});

it.each(["offline", "checksum"])(
  "catches %s failures without staging a bundle",
  async (failure) => {
    if (failure === "offline")
      vi.mocked(fetch).mockRejectedValue(new Error("Offline"));
    else
      vi.mocked(LiveUpdate.downloadBundle).mockRejectedValue(
        new Error("Checksum mismatch"),
      );
    render(<LiveUpdateListener />);
    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(LiveUpdate.setNextBundle).not.toHaveBeenCalled();
  },
);

it("ignores missing manifests and retries on resume", async () => {
  vi.mocked(fetch).mockResolvedValueOnce({ status: 404 } as Response);
  render(<LiveUpdateListener />);
  await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
  resume();
  await waitFor(() => expect(LiveUpdate.setNextBundle).toHaveBeenCalled());
  expect(console.error).not.toHaveBeenCalled();
});

it("prevents overlapping checks and does not stage after unmount", async () => {
  let finish!: () => void;
  vi.mocked(LiveUpdate.downloadBundle).mockReturnValue(
    new Promise<void>((resolve) => {
      finish = resolve;
    }),
  );
  const { unmount } = render(<LiveUpdateListener />);
  await waitFor(() => expect(LiveUpdate.downloadBundle).toHaveBeenCalledOnce());
  resume();
  expect(fetch).toHaveBeenCalledOnce();
  unmount();
  finish();
  await waitFor(() => expect(remove).toHaveBeenCalledOnce());
  expect(LiveUpdate.setNextBundle).not.toHaveBeenCalled();
});
