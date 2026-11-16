// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  AwardsService,
  type CurrentAwardsEventDto,
} from "@repo/wrapper/server";
import { SeasonEventHeader } from "../../../../../packages/ui/src/components/events/view/SeasonEventHeader";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import ptBR from "../../../../../packages/locales/src/translations/json/pt-BR.json";

const session = vi.hoisted(() => ({
  userId: undefined as string | undefined,
}));

function translate(key: string, options?: Record<string, unknown>): string {
  const lookup = (path: string): unknown => {
    let value: unknown = ptBR;
    for (const part of path.split(".")) {
      value =
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)[part]
          : undefined;
    }
    return value;
  };

  const value = lookup(key);
  if (typeof value !== "string") return key;

  return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    String(options?.[name] ?? ""),
  );
}

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: translate,
    i18n: { language: "pt-BR", resolvedLanguage: "pt-BR" },
  }),
  useI18nContext: () => ({
    language: "pt-BR",
    resolvedLanguage: "pt-BR",
    setLanguage: () => {},
    supportedLanguages: ["en", "pt-BR"],
  }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.userId }),
);

function currentEvent(phase: string): CurrentAwardsEventDto {
  return {
    id: 12,
    year: 2026,
    phase,
    categoriesCount: 12,
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
    deletedAt: null,
    votingStartDate: "2026-12-01T00:00:00.000Z",
    votingEndDate: "2026-12-20T23:59:59.000Z",
    // Yesterday keeps the results season active whenever this test runs.
    resultsDate: new Date(Date.now() - 86_400_000).toISOString(),
    nominationStartDate: "2026-11-20T00:00:00.000Z",
    nominationEndDate: "2026-11-28T23:59:59.000Z",
    eligibilityCutoffDate: "2026-11-30T00:00:00.000Z",
  } as unknown as CurrentAwardsEventDto;
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function renderHeader({
  year = 2026,
  screen = "recap",
  push = vi.fn(async () => {}),
}: {
  year?: number;
  screen?: "recap" | "nominations" | "voting" | "results";
  push?: (route: string, options?: { replace?: boolean }) => Promise<void>;
} = {}) {
  return render(<SeasonEventHeader year={year} screen={screen} />, {
    wrapper: ({ children }) => (
      <MantineProvider>
        <QueryClientProvider client={createClient()}>
          <UIProvider
            hooks={{
              useRouter: () => ({
                pathname: "/recap/2026/user-1",
                asPath: "/recap/2026/user-1",
                back: () => {},
                push,
                query: new URLSearchParams(),
              }),
            }}
          >
            {children}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    ),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = undefined;
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
  session.userId = undefined;
});

describe("SeasonEventHeader", () => {
  it("hides the selector for a visitor on the Retrospectiva", async () => {
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCurrentEventV1",
    ).mockResolvedValue(currentEvent("nominations"));

    renderHeader();

    await waitFor(() => expect(screen.getByText("Eventos 2026")).toBeTruthy());

    expect(screen.queryByTestId("season-event-selector")).toBeNull();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.getByText("Retrospectiva")).toBeTruthy();
  });

  it("sends the Awards segment to the vote screen in voting", async () => {
    session.userId = "user-1";
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCurrentEventV1",
    ).mockResolvedValue(currentEvent("voting"));
    const push = vi.fn(async () => {});

    renderHeader({ push });

    await waitFor(() =>
      expect(screen.getByTestId("season-event-selector")).toBeTruthy(),
    );

    fireEvent.click(screen.getByRole("radio", { name: "Awards" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/awards/2026/vote"));
  });

  it("sends the Retrospectiva segment to the signed-in user's Recap", async () => {
    session.userId = "user-1";
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCurrentEventV1",
    ).mockResolvedValue(currentEvent("voting"));
    const push = vi.fn(async () => {});

    renderHeader({ screen: "voting", push });

    await waitFor(() =>
      expect(screen.getByTestId("season-event-selector")).toBeTruthy(),
    );

    fireEvent.click(screen.getByRole("radio", { name: "Retrospectiva" }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/recap/2026/user-1"),
    );
  });

  it.each([
    ["nominations", "/awards/2026/nominations"],
    ["nominations_closed", "/awards/2026/nominations"],
    ["voting", "/awards/2026/vote"],
    ["voting_closed", "/awards/2026/vote"],
    ["results", "/awards/2026/result"],
  ])("sends the Awards segment to the %s screen", async (phase, target) => {
    session.userId = "user-1";
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCurrentEventV1",
    ).mockResolvedValue(currentEvent(phase));
    const push = vi.fn(async () => {});

    renderHeader({ push });

    await waitFor(() =>
      expect(screen.getByTestId("season-event-selector")).toBeTruthy(),
    );

    fireEvent.click(screen.getByRole("radio", { name: "Awards" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith(target));
  });

  it("hides the selector in the upcoming phase, which has no Awards entry", async () => {
    session.userId = "user-1";
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCurrentEventV1",
    ).mockResolvedValue(currentEvent("upcoming"));

    renderHeader();

    await waitFor(() => expect(screen.getByText("Eventos 2026")).toBeTruthy());

    expect(screen.queryByTestId("season-event-selector")).toBeNull();
  });
});
