// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileUserInfoWithBanner } from "../../../../../packages/ui/src/components/profile/view/ProfileUserInfoWithBanner";
import { DEFAULT_SUPPORTER_PREFERENCES } from "../../../../../packages/ui/src/components/supporter/perks/supporterPerks";
import type { SupporterPreferencesResponseDto } from "../../../../../packages/wrapper/src/server";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";

const mocks = vi.hoisted(() => ({
  profile: undefined as Record<string, unknown> | undefined,
  viewerId: undefined as string | undefined,
  push: vi.fn(),
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (
        ({
          "supporter.badge.label": "Supporter",
          "supporter.titles.night_owl": "Night Owl",
        }) as Record<string, string>
      )[key] ?? key,
  }),
  useI18nContext: () => ({ language: "en" }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({
    useUserProfile: () => ({
      data: mocks.profile,
      isLoading: false,
      queryKey: ["userProfile", "u1"],
      invalidate: () => {},
    }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => mocks.viewerId }),
);

vi.mock(
  "../../../../../packages/ui/src/components/follow/hooks/useInfiniteFollowInfo",
  () => ({
    useInfiniteFollowInfo: () => ({
      isSuccess: true,
      data: { pages: [{ pagination: { totalItems: 10 } }] },
    }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/user-level/hooks/useUserLevel",
  () => ({ useUserLevel: () => ({ data: { currentLevel: 3 } }) }),
);

vi.mock(
  "../../../../../packages/ui/src/components/profile/view/ProfileFollowActions",
  () => ({ ProfileFollowActions: () => null }),
);

const baseProfile = {
  customCoverMode: "any",
  userId: "u1",
  username: "alice",
  bio: "",
  avatar: null,
  banner: null,
  avatarVideo: null,
  bannerVideo: null,
  usernameLastUpdatedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function setProfile(
  preferences: SupporterPreferencesResponseDto | null,
  isSupporter = preferences != null,
) {
  mocks.profile = {
    ...baseProfile,
    isSupporter,
    supporterPreferences: preferences,
  };
}

function renderHeader() {
  return render(
    <MantineProvider>
      <UIProvider
        hooks={{
          useRouter: () => ({
            pathname: "/profile/u1",
            asPath: "/profile/u1",
            back: () => {},
            push: mocks.push,
            query: new URLSearchParams(),
          }),
        }}
      >
        <ProfileUserInfoWithBanner userId={"u1"} />
      </UIProvider>
    </MantineProvider>,
  );
}

beforeEach(() => {
  mocks.viewerId = undefined;
  setProjectContext({
    client: "web",
    s3BucketUrl: "",
    serverUrl: "",
    searchUrl: "",
  });
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  setProfile(DEFAULT_SUPPORTER_PREFERENCES);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("ProfileUserInfoWithBanner supporter perks", () => {
  it("renders no badge, strip or frame for a non-supporter", () => {
    setProfile(null, false);

    renderHeader();

    expect(screen.queryByTestId("supporter-badge")).toBeNull();
    expect(screen.queryByTestId("supporter-theme-strip")).toBeNull();
    expect(screen.queryByTestId("supporter-avatar-frame")).toBeNull();
    expect(screen.getByTestId("profile-avatar-frame")).toBeTruthy();
  });

  it("keeps the avatar border and hides only the badge when showBadge is false", () => {
    setProfile({ ...DEFAULT_SUPPORTER_PREFERENCES, showBadge: false });

    renderHeader();

    expect(screen.queryByTestId("supporter-badge")).toBeNull();
    expect(screen.getByTestId("supporter-avatar-frame")).toBeTruthy();
    expect(screen.getByTestId("supporter-theme-strip")).toBeTruthy();
  });

  it("keeps the default border when showAnimatedAvatarBorder is false", () => {
    const profileWithBorderOff = {
      ...DEFAULT_SUPPORTER_PREFERENCES,
      showAnimatedAvatarBorder: false,
    };
    setProfile(profileWithBorderOff);

    renderHeader();

    expect(screen.queryByTestId("supporter-avatar-frame")).toBeNull();
    expect(screen.getByTestId("profile-avatar-frame")).toBeTruthy();
  });

  it("renders the theme strip inside the banner and keeps the username white", () => {
    setProfile(DEFAULT_SUPPORTER_PREFERENCES);

    renderHeader();

    const banner = screen.getByTestId("profile-banner");
    const strip = within(banner).getByTestId("supporter-theme-strip");

    expect(banner.contains(strip)).toBe(true);
    expect(within(strip).getByText("Supporter")).toBeTruthy();

    const username = screen.getByText("alice");

    expect(username.className).toContain("text-white");
    expect(username.style.color).toBe("");
  });

  it("renders no strip when the theme is off", () => {
    setProfile({ ...DEFAULT_SUPPORTER_PREFERENCES, showSupporterTheme: false });

    renderHeader();

    expect(screen.queryByTestId("supporter-theme-strip")).toBeNull();
    expect(
      within(screen.getByTestId("profile-banner")).queryByTestId(
        "supporter-theme-strip",
      ),
    ).toBeNull();
    expect(screen.getByTestId("supporter-badge")).toBeTruthy();
  });

  it.each(["web", "mobile"] as const)(
    "renders the shared identity and title chip on %s",
    (client) => {
      setProjectContext({
        client,
        s3BucketUrl: "",
        serverUrl: "",
        searchUrl: "",
      });
      setProfile({ ...DEFAULT_SUPPORTER_PREFERENCES, titleKey: "night_owl" });

      renderHeader();

      expect(screen.getByRole("heading", { name: "alice" })).toBeTruthy();
      expect(screen.getByText("@alice")).toBeTruthy();
      expect(screen.getByText("Night Owl")).toBeTruthy();
      expect(
        screen.getByRole("button", { name: /10 follow.titles.followers/ }),
      ).toBeTruthy();
    },
  );

  it("opens the profile settings section for the owner", () => {
    mocks.viewerId = "u1";
    renderHeader();

    fireEvent.click(
      screen.getByRole("button", { name: "settings.tabs.profile.label" }),
    );

    expect(mocks.push).toHaveBeenCalledWith(
      "/profile/u1?settings=profile&section=images",
      expect.objectContaining({ replace: false }),
    );
  });

  it("puts the accent CSS variables on the root only for active perks", () => {
    setProfile({
      ...DEFAULT_SUPPORTER_PREFERENCES,
      accentColor: "#FF8800",
    });

    renderHeader();

    const root = document.getElementById("profile-user-info-banner");

    expect(root).toBeTruthy();
    expect(root!.style.getPropertyValue("--profile-accent")).toBe("#FF8800");
    expect(root!.style.getPropertyValue("--profile-accent-text")).not.toBe("");
    expect(root!.style.getPropertyValue("--profile-accent-soft")).not.toBe("");
  });
});
