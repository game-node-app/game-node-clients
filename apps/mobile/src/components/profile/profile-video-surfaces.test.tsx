// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileBanner } from "../../../../../packages/ui/src/components/profile/view/ProfileBanner";
import { SettingsProfileImages } from "../../../../../packages/ui/src/components/settings/tabs/profile/SettingsProfileImages";
import { SupporterProfilePreview } from "../../../../../packages/ui/src/components/supporter/settings/SupporterProfilePreview";

const mocks = vi.hoisted(() => ({
  profile: {
    data: undefined as Record<string, unknown> | undefined,
    isLoading: false,
  },
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useI18nContext: () => ({ language: "en" }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({ useUserProfile: () => mocks.profile }),
);

vi.mock(
  "../../../../../packages/ui/src/components/profile/edit/ProfileEditBannerUploader",
  () => ({ ProfileEditBannerUploader: () => null }),
);

vi.mock(
  "../../../../../packages/ui/src/components/profile/edit/ProfileEditAvatarUploader",
  () => ({ ProfileEditAvatarUploader: () => null }),
);

// The settings surface test is about images and videos, not upload status.
vi.mock(
  "../../../../../packages/ui/src/components/profile/hooks/useProfileVideoUploads",
  () => ({
    useProfileVideoUploads: () => ({
      data: undefined,
      queryKey: ["userProfile", "u1", "own"],
    }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "u1" }),
);

// SettingsProfileImages warms the supporter status before opening the uploaders.
vi.mock(
  "../../../../../packages/ui/src/components/supporter/hooks/useSupporterStatus",
  () => ({
    useSupporterStatus: () => ({
      data: { isSupporter: false },
      isLoading: false,
      isPending: false,
      isError: false,
    }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/follow/hooks/useInfiniteFollowInfo",
  () => ({
    useInfiniteFollowInfo: () => ({
      data: { pages: [{ pagination: { totalItems: 0 } }] },
    }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/collection/collection-entry/hooks/useFavoriteCollectionEntriesForUserId",
  () => ({
    useFavoriteCollectionEntriesForUserId: () => ({ data: { data: [] } }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/game/hooks/useGames",
  () => ({ useGames: () => ({ data: [] }) }),
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

const BANNER_FILE = { filename: "banner-file", extension: "png" };
const BANNER_VIDEO = { filename: "banner-video", extension: "mp4" };

function setProfile(overrides: Record<string, unknown>) {
  mocks.profile = {
    data: {
      userId: "u1",
      username: "alice",
      avatar: null,
      avatarVideo: null,
      banner: BANNER_FILE,
      bannerVideo: null,
      ...overrides,
    },
    isLoading: false,
  };
}

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

function getBannerBackground(container: HTMLElement) {
  const paper = container.querySelector<HTMLElement>(
    '[style*="background-image"]',
  );
  return paper?.style.backgroundImage ?? "";
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

describe("ProfileBanner profile video", () => {
  it("plays the banner video over the static banner image", () => {
    setProfile({ bannerVideo: BANNER_VIDEO });

    const { container } = renderWithMantine(<ProfileBanner userId={"u1"} />);

    expect(getBannerBackground(container)).toContain("banner-file.png");
    expect(screen.queryByTestId("profile-video")).toBeNull();
    expect(screen.getByTestId("profile-video-poster").getAttribute("src")).toBe(
      "banner-file.png",
    );

    triggerIntersection(true);

    expect(screen.getByTestId("profile-video").getAttribute("src")).toBe(
      "banner-video.mp4",
    );
  });

  it("does not play the video while a custom source previews a replacement", () => {
    setProfile({ bannerVideo: BANNER_VIDEO });

    const { container } = renderWithMantine(
      <ProfileBanner userId={"u1"} customSource={"local-preview.png"} />,
    );

    expect(getBannerBackground(container)).toContain("local-preview.png");
    expect(registeredObservers).toHaveLength(0);
    expect(screen.queryByTestId("profile-video")).toBeNull();
    expect(screen.queryByTestId("profile-video-poster")).toBeNull();
  });

  it("keeps the static banner when the profile has no video", () => {
    setProfile({ bannerVideo: null });

    const { container } = renderWithMantine(<ProfileBanner userId={"u1"} />);

    expect(getBannerBackground(container)).toContain("banner-file.png");
    expect(screen.queryByTestId("profile-video")).toBeNull();
    expect(screen.queryByTestId("profile-video-poster")).toBeNull();
  });
});

describe("SettingsProfileImages profile video", () => {
  it("overlays the banner video on the settings preview", () => {
    setProfile({ bannerVideo: BANNER_VIDEO });

    renderWithMantine(<SettingsProfileImages userId={"u1"} />);

    triggerIntersection(true);

    expect(screen.getByTestId("profile-video").getAttribute("src")).toBe(
      "banner-video.mp4",
    );
  });

  it("keeps the static banner when the profile has no video", () => {
    setProfile({ bannerVideo: null });

    renderWithMantine(<SettingsProfileImages userId={"u1"} />);

    expect(screen.queryByTestId("profile-video")).toBeNull();
    expect(screen.queryByTestId("profile-video-poster")).toBeNull();
  });
});

describe("SupporterProfilePreview profile video", () => {
  it("plays the banner video inside the profile preview", () => {
    setProfile({ bannerVideo: BANNER_VIDEO });

    renderWithMantine(<SupporterProfilePreview supporterSince={null} />);

    triggerIntersection(true);

    expect(
      screen
        .getByTestId("supporter-profile-preview")
        .querySelector('[data-testid="profile-video"]')
        ?.getAttribute("src"),
    ).toBe("banner-video.mp4");
  });

  it("keeps the static banner when the profile has no video", () => {
    setProfile({ bannerVideo: null });

    renderWithMantine(<SupporterProfilePreview supporterSince={null} />);

    expect(screen.queryByTestId("profile-video")).toBeNull();
    expect(screen.queryByTestId("profile-video-poster")).toBeNull();
  });
});
