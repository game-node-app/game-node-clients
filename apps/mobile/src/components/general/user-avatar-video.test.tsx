// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserAvatar } from "../../../../../packages/ui/src/components/general/avatar/UserAvatar";

const mocks = vi.hoisted(() => ({
  profile: {
    data: undefined as Record<string, unknown> | undefined,
    isLoading: false,
  },
}));

vi.mock(
  "../../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({ useUserProfile: () => mocks.profile }),
);

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

interface RegisteredObserver {
  callback: ObserverCallback;
}

let registeredObservers: RegisteredObserver[] = [];

class MockIntersectionObserver {
  root: Element | Document | null = null;
  rootMargin = "";
  thresholds: ReadonlyArray<number> = [];

  constructor(callback: ObserverCallback) {
    registeredObservers.push({ callback });
  }

  observe() {}

  unobserve() {}

  disconnect() {}

  takeRecords() {
    return [];
  }
}

function triggerIntersection(isIntersecting: boolean) {
  const observer = registeredObservers[0];
  if (!observer) throw new Error("No IntersectionObserver was registered.");
  act(() => {
    observer.callback([{ isIntersecting }]);
  });
}

const AVATAR_FILE = { filename: "avatar-file", extension: "png" };
const AVATAR_VIDEO = { filename: "avatar-video", extension: "mp4" };

function setProfile(overrides: Record<string, unknown>) {
  mocks.profile = {
    data: {
      userId: "u1",
      username: "alice",
      avatar: AVATAR_FILE,
      avatarVideo: null,
      banner: null,
      bannerVideo: null,
      ...overrides,
    },
    isLoading: false,
  };
}

function renderAvatar(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

beforeEach(() => {
  registeredObservers = [];
  vi.stubGlobal(
    "IntersectionObserver",
    MockIntersectionObserver as unknown as typeof IntersectionObserver,
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  setProfile({});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("UserAvatar profile video", () => {
  it("keeps the static avatar while off-screen and plays the video in view", () => {
    setProfile({ avatarVideo: AVATAR_VIDEO });

    const { container } = renderAvatar(
      <UserAvatar
        userId={"u1"}
        size={72}
        radius={"xl"}
        className={"shrink-0 border-2"}
      />,
    );

    const avatarRoot = container.querySelector<HTMLElement>(
      '[style*="--avatar-size"]',
    )!;
    // Callers' size/radius/className props stay on the Avatar root.
    expect(avatarRoot.className).toContain("shrink-0");
    expect(avatarRoot.className).toContain("border-2");
    expect(avatarRoot.style.getPropertyValue("--avatar-size")).not.toBe("");

    expect(screen.getByTestId("profile-video-poster").getAttribute("src")).toBe(
      "avatar-file.png",
    );
    expect(screen.queryByTestId("profile-video")).toBeNull();

    triggerIntersection(true);

    const videoElement = screen.getByTestId("profile-video");
    expect(videoElement.getAttribute("src")).toBe("avatar-video.mp4");
    expect(videoElement.getAttribute("poster")).toBe("avatar-file.png");
    expect(screen.queryByTestId("profile-video-poster")).toBeNull();
  });

  it("keeps the static avatar when the profile has no video", () => {
    renderAvatar(<UserAvatar userId={"u1"} size={72} />);

    expect(screen.queryByTestId("profile-video")).toBeNull();
    expect(screen.queryByTestId("profile-video-poster")).toBeNull();

    const image = document.querySelector("img");
    expect(image?.getAttribute("src")).toBe("avatar-file.png");
  });

  it("falls back to the static avatar when playback is rejected", async () => {
    setProfile({ avatarVideo: AVATAR_VIDEO });
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(
      new DOMException("Autoplay blocked", "NotAllowedError"),
    );

    renderAvatar(<UserAvatar userId={"u1"} size={72} />);

    triggerIntersection(true);

    await waitFor(() => {
      expect(screen.queryByTestId("profile-video")).toBeNull();
    });
    expect(screen.getByTestId("profile-video-poster").getAttribute("src")).toBe(
      "avatar-file.png",
    );
  });
});
