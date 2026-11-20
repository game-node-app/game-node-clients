// @vitest-environment jsdom
/* eslint-disable react/display-name -- mock components for the test doubles */
import React from "react";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import { XboxProfileView } from "../../../../packages/ui/src/theme/themes/xbox/screens/XboxProfileView";
import { XboxProfileViewNavbarItem } from "../../../../packages/ui/src/theme/themes/xbox/screens/XboxProfileViewNavbarItem";
import { setupDom } from "../components/mcp/testUtils";

const state = vi.hoisted(() => ({
  profile: undefined as Record<string, unknown> | undefined,
  overview: undefined as Record<string, number> | undefined,
  level: undefined as
    | { currentLevel: number; currentLevelExp: number; levelUpExpCost: number }
    | undefined,
  viewerId: undefined as string | undefined,
  tab: "",
  settingsOpen: vi.fn(),
}));

vi.mock(
  "../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({
    useUserProfile: () => ({
      data: state.profile,
      isLoading: false,
      queryKey: ["userProfile", "u1"],
    }),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/profile/hooks/useProfileMetricsOverview",
  () => ({
    useProfileMetricsOverview: () => ({
      data: state.overview,
      isLoading: false,
    }),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/user-level/hooks/useUserLevel",
  () => ({
    useUserLevel: () => ({ data: state.level }),
  }),
);
vi.mock("../../../../packages/ui/src/components/auth/hooks/useUserId", () => ({
  useUserId: () => state.viewerId,
}));
vi.mock(
  "../../../../packages/ui/src/components/settings/hooks/useSettingsModalState",
  () => ({ useSettingsModalState: () => ({ open: state.settingsOpen }) }),
);
vi.mock(
  "../../../../packages/ui/src/components/general/avatar/UserAvatar",
  () => ({
    UserAvatar: ({ alt }: { alt?: string }) => (
      <span data-testid={"user-avatar"}>{alt}</span>
    ),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/profile/view/ProfileFollowInfo",
  () => ({
    ProfileFollowInfo: ({ criteria }: { criteria: string }) => (
      <button data-testid={`follow-info-${criteria}`}>{criteria}</button>
    ),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/profile/view/ProfileFollowActions",
  () => ({
    ProfileFollowActions: () => <button>Follow</button>,
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/profile/view/ProfileUserInfoConnections",
  () => ({
    ProfileUserInfoConnections: () => (
      <div data-testid={"connections"}>Connections</div>
    ),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/profile/view/ProfileFeaturedAchievements",
  () => ({
    ProfileFeaturedAchievements: () => (
      <div data-testid={"featured-achievements"}>Achievements</div>
    ),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/profile/view/ProfileVideo",
  () => ({
    ProfileVideo: () => <div data-testid={"profile-video"} />,
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/supporter/perks/SupporterAvatarFrame",
  () => ({
    SupporterAvatarFrame: ({ children }: { children: React.ReactNode }) => (
      <div data-testid={"supporter-frame"}>{children}</div>
    ),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/supporter/perks/SupporterBadge",
  () => ({
    SupporterBadge: () => <span data-testid={"supporter-badge"} />,
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/supporter/perks/SupporterTitle",
  () => ({
    SupporterTitle: () => <span data-testid={"supporter-title"} />,
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/supporter/perks/SupporterPresenceChip",
  () => ({
    SupporterPresenceChip: () => <span data-testid={"supporter-presence"} />,
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/report/modal/ReportCreateFormModal",
  () => ({ ReportCreateFormModal: () => null }),
);
vi.mock(
  "../../../../packages/ui/src/components/general/input/ItemDropdown",
  () => {
    const ItemDropdown = ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    );
    ItemDropdown.ReportButton = ({
      onClick,
      disabled,
    }: {
      onClick?: () => void;
      disabled?: boolean;
    }) => (
      <button onClick={onClick} disabled={disabled}>
        Report
      </button>
    );
    ItemDropdown.RemoveButton = ({ onClick }: { onClick?: () => void }) => (
      <button onClick={onClick}>Remove</button>
    );
    ItemDropdown.EditButton = () => null;
    ItemDropdown.ShareButton = () => null;
    return { ItemDropdown };
  },
);

const baseProfile = {
  userId: "u1",
  username: "alice",
  bio: "Playing everything.",
  canViewLibrary: true,
  libraryVisibility: "public",
  isSupporter: false,
  supporterPreferences: null,
  banner: null,
  bannerVideo: null,
  avatar: null,
  createdAt: "2024-03-04T00:00:00.000Z",
};

const hooks = {
  useRouter: () => ({
    pathname: "/profile/u1",
    back: vi.fn(),
    push: async () => {},
    query: new URLSearchParams(state.tab ? { tab: state.tab } : undefined),
  }),
};

const renderProfile = (userId = "u1") =>
  render(
    <I18nProvider language="en">
      <MantineProvider>
        <UIProvider hooks={hooks}>
          <XboxProfileView userId={userId}>
            <div data-testid={"profile-tab-content"}>Tab content</div>
          </XboxProfileView>
        </UIProvider>
      </MantineProvider>
    </I18nProvider>,
  );

beforeEach(() => {
  setupDom();
  state.profile = { ...baseProfile };
  state.overview = {
    totalGames: 20,
    totalCollections: 3,
    totalFinishedGames: 10,
    totalFinishedGamesInYear: 4,
    totalPlayedGames: 12,
    totalPlayedGamesInYear: 4,
    totalEstimatedPlaytime: 7200,
  };
  state.level = { currentLevel: 3, currentLevelExp: 50, levelUpExpCost: 100 };
  state.viewerId = "u1";
  state.tab = "";
  state.settingsOpen.mockClear();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Xbox profile gamercard", () => {
  it("shows the edit action and the stats summary on the owner's profile", () => {
    renderProfile();

    expect(screen.getByTestId("xbox-profile-gamercard")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "alice" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit profile" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Follow" })).toBeNull();
    expect(screen.queryByText("Report")).toBeNull();

    expect(
      screen
        .getByRole("progressbar", { name: "50 / 100 XP" })
        .getAttribute("aria-valuenow"),
    ).toBe("50");
    const summary = screen.getByTestId("xbox-profile-stats");
    expect(summary).toBeTruthy();
    expect(within(summary).getByText("12")).toBeTruthy();
    expect(within(summary).getByText("50%")).toBeTruthy();
    expect(screen.getByTestId("connections")).toBeTruthy();
    expect(screen.getByTestId("featured-achievements")).toBeTruthy();
    expect(screen.getByTestId("profile-tab-content")).toBeTruthy();
  });

  it("keeps the default profile follow/report actions for another profile", () => {
    state.viewerId = "u2";

    renderProfile();

    expect(screen.queryByRole("button", { name: "Edit profile" })).toBeNull();
    expect(screen.getByRole("button", { name: "Follow" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Report" })).toBeTruthy();
    expect(screen.getByTestId("follow-info-followers")).toBeTruthy();
    expect(screen.getByTestId("follow-info-following")).toBeTruthy();
  });

  it("hides every library-derived number when the library is hidden", () => {
    state.viewerId = "u2";
    state.profile = {
      ...baseProfile,
      canViewLibrary: false,
      libraryVisibility: "private",
    };
    state.overview = {
      totalGames: 20,
      totalCollections: 3,
      totalFinishedGames: 10,
      totalFinishedGamesInYear: 4,
      totalPlayedGames: 12,
      totalPlayedGamesInYear: 4,
      totalEstimatedPlaytime: 7200,
    };

    renderProfile();

    expect(screen.queryByTestId("xbox-profile-stats")).toBeNull();
    expect(screen.queryByText("12")).toBeNull();
    expect(screen.queryByText("50%")).toBeNull();
    // the profile identity remains visible; only the hidden data is suppressed
    expect(screen.getByRole("heading", { name: "alice" })).toBeTruthy();
  });

  it("keeps the stats summary out of the other profile tabs", () => {
    state.tab = "stats";

    renderProfile();

    expect(screen.queryByTestId("xbox-profile-stats")).toBeNull();
    expect(screen.getByTestId("profile-tab-content")).toBeTruthy();
  });

  it("renders supporter perks and the banner video when present", () => {
    state.profile = {
      ...baseProfile,
      isSupporter: true,
      supporterPreferences: {
        showBadge: true,
        titleKey: "completionist",
        showAnimatedAvatarBorder: true,
        showSupporterTheme: true,
        accentColor: null,
        showOnSupportersWall: true,
        showLiveProfile: true,
      },
      bannerVideo: { filename: "banner", extension: "mp4" },
    };

    renderProfile();

    expect(screen.getByTestId("supporter-badge")).toBeTruthy();
    expect(screen.getByTestId("supporter-title")).toBeTruthy();
    expect(screen.getByTestId("supporter-presence")).toBeTruthy();
    expect(screen.getByTestId("supporter-frame")).toBeTruthy();
    expect(screen.getByTestId("profile-video")).toBeTruthy();
  });
});

describe("Xbox profile tab pill", () => {
  it("marks the selected tab and shows its count", () => {
    const onClick = vi.fn();

    render(
      <MantineProvider>
        <XboxProfileViewNavbarItem
          label={"Games"}
          count={"12"}
          active
          onClick={onClick}
        />
      </MantineProvider>,
    );

    const tab = screen.getByRole("button", { name: /Games/ });
    expect(tab.getAttribute("aria-current")).toBe("page");
    expect(tab.hasAttribute("data-active")).toBe(true);

    fireEvent.click(tab);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
