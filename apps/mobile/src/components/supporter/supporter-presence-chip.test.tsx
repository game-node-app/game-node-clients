// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlayingGameDto, ProfileService } from "@repo/wrapper/server";
import type { ProfilePresenceResponseDto } from "@repo/wrapper/server";
import { SupporterPresenceChip } from "../../../../../packages/ui/src/components/supporter/perks/SupporterPresenceChip";
import {
  DEFAULT_SUPPORTER_PREFERENCES,
  getActiveSupporterPerks,
} from "../../../../../packages/ui/src/components/supporter/perks/supporterPerks";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (
        ({
          "supporter.presence.playingNow": "Playing now",
        }) as Record<string, string>
      )[key] ?? key,
  }),
  useI18nContext: () => ({ language: "en" }),
}));

const perks = getActiveSupporterPerks({
  isSupporter: true,
  supporterPreferences: {
    ...DEFAULT_SUPPORTER_PREFERENCES,
    showLiveProfile: true,
  },
});

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function createWrapper() {
  const client = createClient();

  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <MantineProvider>
        <QueryClientProvider client={client}>
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
                pathname: "/profile/user-1",
                asPath: "/profile/user-1",
                back: () => {},
                push: async () => {},
                query: new URLSearchParams(),
              }),
            }}
          >
            {children}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    );
  };
}

const presence = (response: ProfilePresenceResponseDto) =>
  vi
    .spyOn(ProfileService, "profilePresenceControllerGetPresenceV1")
    .mockResolvedValue(response);

beforeEach(() => {
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
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SupporterPresenceChip", () => {
  it("links to the game page when the catalog knows the game", async () => {
    presence({
      playing: { source: PlayingGameDto.source.STEAM, name: "Hades", gameId: 12345 },
    });

    render(<SupporterPresenceChip userId={"user-1"} perks={perks} />, {
      wrapper: createWrapper(),
    });

    const link = await screen.findByLabelText("Playing now: Hades");

    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/game/12345");
    expect(link.textContent).toContain("Playing now · Hades");
    expect(link.textContent).toContain("Hades");
  });

  it("shows the Steam name without a link when gameId is null", async () => {
    presence({
      playing: { source: PlayingGameDto.source.STEAM, name: "Hades", gameId: null },
    });

    render(<SupporterPresenceChip userId={"user-1"} perks={perks} />, {
      wrapper: createWrapper(),
    });

    const chip = await screen.findByLabelText("Playing now: Hades");

    expect(chip.getAttribute("data-testid")).toBe("supporter-presence-chip");
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Hades")).toBeTruthy();
  });

  it("renders nothing when playing is null", async () => {
    const request = presence({ playing: null });

    render(<SupporterPresenceChip userId={"user-1"} perks={perks} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    expect(screen.queryByTestId("supporter-presence-chip")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("makes no presence request when the perk is off", async () => {
    const request = presence({ playing: null });
    const perksWithoutLive = getActiveSupporterPerks({
      isSupporter: true,
      supporterPreferences: DEFAULT_SUPPORTER_PREFERENCES,
    });

    render(
      <SupporterPresenceChip userId={"user-1"} perks={perksWithoutLive} />,
      { wrapper: createWrapper() },
    );

    expect(perksWithoutLive?.liveProfile).toBe(false);
    await act(async () => {
      await Promise.resolve();
    });
    expect(request).not.toHaveBeenCalled();
    expect(screen.queryByTestId("supporter-presence-chip")).toBeNull();
  });
});
