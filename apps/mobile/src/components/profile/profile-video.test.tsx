// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import {
  PROFILE_VIDEO_ROOT_MARGIN,
  useProfileVideoPlayback,
} from "../../../../../packages/ui/src/components/profile/hooks/useProfileVideoPlayback";
import { ProfileVideo } from "../../../../../packages/ui/src/components/profile/view/ProfileVideo";

type ObserverCallback = (
  entries: { isIntersecting: boolean }[],
  observer: unknown,
) => void;

interface RegisteredObserver {
  callback: ObserverCallback;
  options?: { rootMargin?: string };
}

let registeredObservers: RegisteredObserver[] = [];

class MockIntersectionObserver {
  root: Element | Document | null = null;
  rootMargin = "";
  thresholds: ReadonlyArray<number> = [];

  constructor(callback: ObserverCallback, options?: { rootMargin?: string }) {
    registeredObservers.push({ callback, options });
  }

  observe() {}

  unobserve() {}

  disconnect() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function stubMatchMedia(reducedMotion: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reducedMotion && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function triggerIntersection(isIntersecting: boolean) {
  const observer = registeredObservers[0];
  if (!observer) throw new Error("No IntersectionObserver was registered.");
  act(() => {
    observer.callback([{ isIntersecting }], observer);
  });
}

function PlaybackHarness() {
  const { containerRef, videoRef, shouldMountVideo, hasFailed } =
    useProfileVideoPlayback();

  return (
    <div ref={containerRef} data-testid={"container"}>
      {shouldMountVideo ? (
        <video ref={videoRef} data-testid={"video"} />
      ) : (
        <span data-testid={"poster"} />
      )}
      {hasFailed && <span data-testid={"failed"} />}
    </div>
  );
}

beforeEach(() => {
  registeredObservers = [];
  vi.stubGlobal(
    "IntersectionObserver",
    MockIntersectionObserver as unknown as typeof IntersectionObserver,
  );
  stubMatchMedia(false);
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useProfileVideoPlayback", () => {
  it("keeps the poster while the slot is far from the viewport", () => {
    render(<PlaybackHarness />);

    expect(screen.queryByTestId("video")).toBeNull();
    expect(screen.getByTestId("poster")).toBeTruthy();
    expect(registeredObservers[0]?.options?.rootMargin).toBe(
      PROFILE_VIDEO_ROOT_MARGIN,
    );
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("mounts the video and starts playback once it approaches the viewport", () => {
    render(<PlaybackHarness />);

    triggerIntersection(true);

    expect(screen.getByTestId("video")).toBeTruthy();
    expect(screen.queryByTestId("poster")).toBeNull();
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);

    triggerIntersection(false);

    expect(screen.queryByTestId("video")).toBeNull();
    expect(screen.getByTestId("poster")).toBeTruthy();
  });

  it("never mounts the video when the user prefers reduced motion", () => {
    stubMatchMedia(true);
    render(<PlaybackHarness />);

    triggerIntersection(true);

    expect(screen.queryByTestId("video")).toBeNull();
    expect(screen.getByTestId("poster")).toBeTruthy();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("flags a rejected play() and falls back to the poster", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(
      new DOMException("Autoplay blocked", "NotAllowedError"),
    );

    render(<PlaybackHarness />);

    triggerIntersection(true);

    await waitFor(() => {
      expect(screen.getByTestId("failed")).toBeTruthy();
    });
    expect(screen.queryByTestId("video")).toBeNull();
    expect(screen.getByTestId("poster")).toBeTruthy();
  });

  it("flags a media error event and falls back to the poster", async () => {
    render(<PlaybackHarness />);

    triggerIntersection(true);
    fireEvent.error(screen.getByTestId("video"));

    await waitFor(() => {
      expect(screen.getByTestId("failed")).toBeTruthy();
    });
    expect(screen.queryByTestId("video")).toBeNull();
  });
});

describe("ProfileVideo", () => {
  const video = { filename: "avatar-video", extension: "mp4" };

  function renderProfileVideo(ui: React.ReactElement) {
    return render(<MantineProvider>{ui}</MantineProvider>);
  }

  it("renders the poster image until the video mounts, then plays it inline", () => {
    renderProfileVideo(<ProfileVideo video={video} poster={"avatar.png"} />);

    const poster = screen.getByTestId("profile-video-poster");
    expect(poster.getAttribute("src")).toBe("avatar.png");
    expect(screen.queryByTestId("profile-video")).toBeNull();

    triggerIntersection(true);

    const videoElement = screen.getByTestId(
      "profile-video",
    ) as HTMLVideoElement;
    expect(videoElement.getAttribute("src")).toBe("avatar-video.mp4");
    expect(videoElement.getAttribute("poster")).toBe("avatar.png");
    expect(videoElement.muted).toBe(true);
    expect(videoElement.loop).toBe(true);
    expect(videoElement.autoplay).toBe(true);
    expect(videoElement.hasAttribute("playsinline")).toBe(true);
  });

  it("renders nothing without a published video", () => {
    renderProfileVideo(<ProfileVideo video={null} poster={"avatar.png"} />);

    expect(screen.queryByTestId("profile-video")).toBeNull();
    expect(screen.queryByTestId("profile-video-poster")).toBeNull();
  });
});
