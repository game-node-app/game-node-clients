// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserAvatarGroup } from "../../../../../packages/ui/src/components/general/avatar/UserAvatarGroup";
import { DEFAULT_SUPPORTER_PREFERENCES } from "../../../../../packages/ui/src/components/supporter/perks/supporterPerks";
import type { SupporterPreferencesResponseDto } from "../../../../../packages/wrapper/src/server";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";

const mocks = vi.hoisted(() => ({
  profile: undefined as Record<string, unknown> | undefined,
  presenceCalls: 0,
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
  "../../../../../packages/ui/src/components/supporter/hooks/useProfilePresence",
  () => ({
    useProfilePresence: () => {
      mocks.presenceCalls += 1;
      return { data: undefined };
    },
  }),
);

function setProfile(preferences: SupporterPreferencesResponseDto | null) {
  mocks.profile = {
    customCoverMode: "any",
    isSupporter: preferences != null,
    supporterPreferences: preferences,
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
}

function Wrapper({ children }: PropsWithChildren) {
  return (
    <MantineProvider>
      <UIProvider
        presenters={{
          Link: ({ href, children: linkChildren, ...others }) => (
            <a href={href} {...others}>
              {linkChildren}
            </a>
          ),
        }}
        hooks={{
          useRouter: () => ({
            pathname: "/",
            asPath: "/",
            back: () => {},
            push: async () => {},
            query: new URLSearchParams(),
          }),
        }}
      >
        {children}
      </UIProvider>
    </MantineProvider>
  );
}

beforeEach(() => {
  setProjectContext({
    client: "web",
    s3BucketUrl: "",
    serverUrl: "",
    searchUrl: "",
  });
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
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  mocks.presenceCalls = 0;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("UserAvatarGroup supporter badge", () => {
  it("shows the compact crown when showBadge is true", () => {
    setProfile({ ...DEFAULT_SUPPORTER_PREFERENCES, showBadge: true });

    render(<UserAvatarGroup userId={"u1"} />, { wrapper: Wrapper });

    expect(screen.getByTestId("supporter-badge-compact")).toBeTruthy();
    expect(screen.getByLabelText("Supporter")).toBeTruthy();
  });

  it("shows no badge when showBadge is false", () => {
    setProfile({ ...DEFAULT_SUPPORTER_PREFERENCES, showBadge: false });

    render(<UserAvatarGroup userId={"u1"} />, { wrapper: Wrapper });

    expect(screen.queryByTestId("supporter-badge-compact")).toBeNull();
    expect(screen.queryByLabelText("Supporter")).toBeNull();
  });

  it("shows no badge when the profile has no preferences", () => {
    setProfile(null);

    render(<UserAvatarGroup userId={"u1"} />, { wrapper: Wrapper });

    expect(screen.queryByTestId("supporter-badge-compact")).toBeNull();
  });

  it("never requests presence from a list item", () => {
    setProfile({ ...DEFAULT_SUPPORTER_PREFERENCES, showLiveProfile: true });

    render(<UserAvatarGroup userId={"u1"} />, { wrapper: Wrapper });

    expect(mocks.presenceCalls).toBe(0);
  });
});
