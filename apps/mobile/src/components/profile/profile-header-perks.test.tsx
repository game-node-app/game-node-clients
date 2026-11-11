// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileUserInfoWithBanner } from "../../../../../packages/ui/src/components/profile/view/ProfileUserInfoWithBanner";
import { DEFAULT_SUPPORTER_PREFERENCES } from "../../../../../packages/ui/src/components/supporter/perks/supporterPerks";
import type { SupporterPreferencesResponseDto } from "../../../../../packages/wrapper/src/server";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";

const mocks = vi.hoisted(() => ({
  profile: undefined as Record<string, unknown> | undefined,
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (
        ({
          "supporter.badge.label": "Supporter",
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
  () => ({ useUserId: () => undefined }),
);

// The mobile header renders edit/follow actions, which need a QueryClient this
// test does not provide; the header geometry is what matters here.
vi.mock(
  "../../../../../packages/ui/src/components/profile/view/ProfileAvatarSectionButtons",
  () => ({ ProfileAvatarSectionButtons: () => null }),
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
        presenters={{ ProfileUserInfo: () => null }}
        hooks={{
          useRouter: () => ({
            pathname: "/profile/u1",
            asPath: "/profile/u1",
            back: () => {},
            push: async () => {},
            query: new URLSearchParams(),
          }),
        }}
      >
        <ProfileUserInfoWithBanner userId={"u1"} />
      </UIProvider>
    </MantineProvider>,
  );
}

function hasBorderClass(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>("div")).some((el) =>
    el.className.includes("border-[#161616]"),
  );
}

function getInfoColumn() {
  return screen.getByTestId("profile-info-column");
}

beforeEach(() => {
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

    const { container } = renderHeader();

    expect(screen.queryByTestId("supporter-badge")).toBeNull();
    expect(screen.queryByTestId("supporter-theme-strip")).toBeNull();
    expect(screen.queryByTestId("supporter-avatar-frame")).toBeNull();
    expect(getInfoColumn().style.getPropertyValue("--supporter-tint-end")).toBe(
      "",
    );
    expect(hasBorderClass(container)).toBe(true);
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

    const { container } = renderHeader();

    expect(screen.queryByTestId("supporter-avatar-frame")).toBeNull();
    expect(hasBorderClass(container)).toBe(true);
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
    expect(getInfoColumn().style.getPropertyValue("--supporter-tint-end")).toBe(
      "",
    );
    expect(screen.getByTestId("supporter-badge")).toBeTruthy();
  });

  // jsdom drops inline gradient values, so the platform-specific end color is
  // asserted through the CSS variable the gradient consumes.
  it("tints the whole info column on web", () => {
    setProfile({
      ...DEFAULT_SUPPORTER_PREFERENCES,
      accentColor: "#FF8800",
    });

    renderHeader();

    const column = getInfoColumn();

    expect(column.style.getPropertyValue("--supporter-tint-end")).toBe(
      "#151515",
    );
    expect(within(column).getByText("alice")).toBeTruthy();
  });

  it("tints the whole info column on the mobile platform", () => {
    setProjectContext({
      client: "mobile",
      s3BucketUrl: "",
      serverUrl: "",
      searchUrl: "",
    });
    setProfile({
      ...DEFAULT_SUPPORTER_PREFERENCES,
      accentColor: "#FF8800",
    });

    renderHeader();

    const column = getInfoColumn();

    expect(column.style.getPropertyValue("--supporter-tint-end")).toBe(
      "#111111",
    );
    expect(within(column).getByText("alice")).toBeTruthy();
  });

  it("puts the accent CSS variables on the root only for active perks", () => {
    setProfile({
      ...DEFAULT_SUPPORTER_PREFERENCES,
      accentColor: "#FF8800",
    });

    renderHeader();

    const root = document.getElementById("profile-user-info-banner");

    expect(root).toBeTruthy();
    expect(root!.style.getPropertyValue("--supporter-accent")).toBe("#FF8800");
    expect(root!.style.getPropertyValue("--supporter-accent-text")).not.toBe(
      "",
    );
    expect(root!.style.getPropertyValue("--supporter-accent-soft")).not.toBe(
      "",
    );
    expect(root!.style.getPropertyValue("--supporter-accent-border")).not.toBe(
      "",
    );
  });
});
