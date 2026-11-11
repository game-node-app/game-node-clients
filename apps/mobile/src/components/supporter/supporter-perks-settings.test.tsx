// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  ProfileService,
} from "../../../../../packages/wrapper/src/server";
import type {
  SupporterPreferencesResponseDto,
} from "../../../../../packages/wrapper/src/server";
import {
  DEFAULT_SUPPORTER_PREFERENCES,
  getActiveSupporterPerks,
} from "../../../../../packages/ui/src/components/supporter/perks/supporterPerks";
import {
  SupporterPerksSettings,
  type SupporterPerksSettingsProps,
} from "../../../../../packages/ui/src/components/supporter/settings/SupporterPerksSettings";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { UIHookRegistry } from "../../../../../packages/ui/src/context/registry";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";

const mocks = vi.hoisted(() => ({
  connection: {
    data: { id: "connection-1" } as unknown,
    isSuccess: true,
    isError: false,
    error: null as unknown,
  },
  connectionHook: vi.fn(),
}));

vi.mock("@repo/locales", () => {
  const translations: Record<string, string> = {
    "supporter.perks.titleSelect.title": "Title",
  };

  return {
    useTranslation: () => ({
      t: (key: string) => translations[key] ?? key,
    }),
    useI18nContext: () => ({ language: "en" }),
  };
});

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "user-1" }),
);

vi.mock(
  "../../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({
    useUserProfile: () => ({
      data: { username: "cassio", banner: null, avatar: null },
      isLoading: false,
    }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/connections/hooks/useOwnUserConnectionByType",
  () => ({
    useOwnUserConnectionByType: (...args: unknown[]) => {
      mocks.connectionHook(...args);

      return mocks.connection;
    },
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/follow/hooks/useInfiniteFollowInfo",
  () => ({
    useInfiniteFollowInfo: () => ({
      data: { pages: [{ pagination: { totalItems: 3 } }] },
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

const PREFERENCES: SupporterPreferencesResponseDto = {
  ...DEFAULT_SUPPORTER_PREFERENCES,
  titleKey: "patron",
};

const PERKS = getActiveSupporterPerks({
  isSupporter: true,
  supporterPreferences: PREFERENCES,
});

const EXAMPLE_PERKS = getActiveSupporterPerks({
  isSupporter: true,
  supporterPreferences: DEFAULT_SUPPORTER_PREFERENCES,
});

function apiError(status: number) {
  return new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    {
      status,
      statusText: "",
      url: "/v1/profile/supporter-preferences",
      body: null,
      ok: false,
    },
    "preferences error",
  );
}

const MockLink = ({
  children,
  ...props
}: React.ComponentProps<"a">) => <a {...props}>{children}</a>;

const HOOKS = {} as unknown as UIHookRegistry;

function renderSettings(
  props: Partial<SupporterPerksSettingsProps> = {},
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  }),
) {
  return render(
    <QueryClientProvider client={client}>
      <MantineProvider>
        <UIProvider presenters={{ Link: MockLink }} hooks={HOOKS}>
          <SupporterPerksSettings
            mode={"edit"}
            prefs={PREFERENCES}
            perks={PERKS}
            caption={"supporter.perks.preview.caption"}
            onWall={true}
            supporterSince={null}
            {...props}
          />
        </UIProvider>
      </MantineProvider>
    </QueryClientProvider>,
  );
}

const SWITCH_FIELDS = [
  ["supporter.perks.theme.title", "showSupporterTheme", false],
  ["supporter.perks.badge.title", "showBadge", false],
  ["supporter.perks.border.title", "showAnimatedAvatarBorder", false],
  ["supporter.perks.wall.title", "showOnSupportersWall", false],
  ["supporter.perks.live.title", "showLiveProfile", true],
] as const;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.connection = {
    data: { id: "connection-1" },
    isSuccess: true,
    isError: false,
    error: null,
  };
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
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SupporterPerksSettings", () => {
  it("sends exactly one field per switch in edit mode", async () => {
    const request = vi
      .spyOn(ProfileService, "supporterPreferencesControllerUpdateV1")
      .mockResolvedValue(PREFERENCES);

    renderSettings();

    for (const [label, field, expected] of SWITCH_FIELDS) {
      fireEvent.click(screen.getByRole("switch", { name: label }));

      await waitFor(() => {
        expect(request).toHaveBeenCalledWith({ [field]: expected });
      });
    }

    expect(request).toHaveBeenCalledTimes(SWITCH_FIELDS.length);
  });

  it("sends null when the title select picks No title", async () => {
    const request = vi
      .spyOn(ProfileService, "supporterPreferencesControllerUpdateV1")
      .mockResolvedValue({ ...PREFERENCES, titleKey: null });
    const user = userEvent.setup();

    renderSettings();

    const combobox = screen.getByRole("combobox", {
      name: "Title",
    });

    fireEvent.mouseDown(combobox);
    await user.click(
      await screen.findByText("supporter.perks.titleSelect.none"),
    );

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith({ titleKey: null });
    });
  });

  it("shows Saved after success and nothing after an error", async () => {
    const request = vi
      .spyOn(ProfileService, "supporterPreferencesControllerUpdateV1")
      .mockResolvedValue({ ...PREFERENCES, showSupporterTheme: false });

    renderSettings();

    fireEvent.click(
      screen.getByRole("switch", { name: "supporter.perks.theme.title" }),
    );

    await waitFor(() => {
      expect(screen.getByText("supporter.perks.saved")).toBeTruthy();
    });

    request.mockRejectedValue(apiError(400));
    fireEvent.click(
      screen.getByRole("switch", { name: "supporter.perks.badge.title" }),
    );

    const { notifications } = await import("@mantine/notifications");
    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalled();
    });

    expect(screen.queryByText("supporter.perks.saved")).toBeNull();
    expect(screen.queryByText("supporter.perks.saving")).toBeNull();
  });

  it("locks every control, hides the accent row and sends nothing when locked", () => {
    const request = vi.spyOn(
      ProfileService,
      "supporterPreferencesControllerUpdateV1",
    );

    const { container } = renderSettings({
      mode: "locked",
      prefs: null,
      perks: EXAMPLE_PERKS,
      caption: "supporter.perks.preview.exampleCaption",
      onWall: null,
    });

    const switches = screen.getAllByRole("switch");

    expect(switches).toHaveLength(SWITCH_FIELDS.length);
    for (const item of switches) {
      expect((item as HTMLInputElement).disabled).toBe(true);
      expect(item.getAttribute("aria-label")).toMatch(
        /, supporter\.perks\.locked\.label$/,
      );
    }

    expect(screen.queryByText("supporter.perks.accent.title")).toBeNull();
    expect(screen.getByText("supporter.perks.locked.note")).toBeTruthy();
    expect(
      screen.getByRole("combobox", {
        name: "Title, supporter.perks.locked.label",
      }),
    ).toBeTruthy();
    expect(screen.getByDisplayValue("supporter.perks.titleSelect.none")).toBeTruthy();
    expect(
      container.querySelectorAll('[data-testid="supporter-perk-lock"]'),
    ).toHaveLength(SWITCH_FIELDS.length + 1);

    expect(request).not.toHaveBeenCalled();
    expect(mocks.connectionHook).not.toHaveBeenCalled();
  });

  it("disables the controls and retries the profile in unavailable mode", () => {
    const onRetry = vi.fn();

    renderSettings({
      mode: "unavailable",
      prefs: null,
      perks: EXAMPLE_PERKS,
      caption: "supporter.perks.preview.exampleCaption",
      onWall: null,
      onRetry,
    });

    for (const item of screen.getAllByRole("switch")) {
      expect((item as HTMLInputElement).disabled).toBe(true);
    }
    // The accent row is visible, still disabled.
    expect(screen.getByText("supporter.perks.accent.title")).toBeTruthy();
    expect(screen.getByText("supporter.perks.errors.missing")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.perks.errors.retry" }),
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows Included in edit/unavailable and Supporters when locked", () => {
    renderSettings();
    expect(screen.getByText("supporter.perks.included")).toBeTruthy();
    expect(screen.getByText("settings.badges.comingSoon")).toBeTruthy();
    cleanup();

    renderSettings({
      mode: "unavailable",
      prefs: null,
      perks: EXAMPLE_PERKS,
      caption: "supporter.perks.preview.exampleCaption",
      onWall: null,
    });
    expect(screen.getByText("supporter.perks.included")).toBeTruthy();
    expect(screen.getByText("settings.badges.comingSoon")).toBeTruthy();
    cleanup();

    renderSettings({
      mode: "locked",
      prefs: null,
      perks: EXAMPLE_PERKS,
      caption: "supporter.perks.preview.exampleCaption",
      onWall: null,
    });
    expect(screen.getByText("supporter.features.availableLabel")).toBeTruthy();
    // Custom covers stay upcoming in every mode.
    expect(screen.getByText("settings.badges.comingSoon")).toBeTruthy();
  });

  it("adds the Steam hint in edit mode when no Steam account is connected", () => {
    mocks.connection = {
      data: undefined,
      isSuccess: false,
      isError: true,
      error: apiError(404),
    };

    renderSettings();

    expect(mocks.connectionHook).toHaveBeenCalledWith("steam");
    expect(screen.getByText("supporter.perks.live.needsSteam")).toBeTruthy();
  });

  it("links to the wall only when this surface has no wall of its own", () => {
    renderSettings();

    expect(
      screen
        .getByRole("link", { name: "supporter.perks.wall.seeWall" })
        .getAttribute("href"),
    ).toBe("/about#supporters");
    cleanup();

    renderSettings({ withSupportersWall: true });

    expect(
      screen.queryByRole("link", { name: "supporter.perks.wall.seeWall" }),
    ).toBeNull();
  });
});
