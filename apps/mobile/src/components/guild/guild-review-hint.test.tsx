// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GuildAccessResponseDto,
  GuildContractDto,
  GuildService,
} from "@repo/wrapper/server";
import type { GuildContractsListResponseDto } from "@repo/wrapper/server";
import { GuildReviewLengthHint } from "../../../../../packages/ui/src/components/guild/view/GuildReviewLengthHint";
import { getReviewPlainTextLength } from "../../../../../packages/ui/src/components/guild/util/getReviewPlainTextLength";
import { guildKeys } from "../../../../../packages/ui/src/components/guild/hooks/guildKeys";

const session = vi.hoisted(() => ({
  userId: "user-1" as string | undefined,
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options: Record<string, unknown> = {}) => {
      if (key === "guild.reviewHint.counter" && options.count !== undefined) {
        return `${options.count}/80`;
      }

      return `t:${key}`;
    },
  }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.userId }),
);

const ACCESS_TRUE: GuildAccessResponseDto = {
  mode: GuildAccessResponseDto.mode.SUPPORTERS,
  hasAccess: true,
};

const ACCESS_FALSE: GuildAccessResponseDto = {
  mode: GuildAccessResponseDto.mode.SUPPORTERS,
  hasAccess: false,
};

function makeContract(overrides: Partial<GuildContractDto>): GuildContractDto {
  return {
    id: "contract-1",
    boardEntryId: "board-1",
    eventId: null,
    category: GuildContractDto.category.LIBRARY,
    templateKey: "captains_log",
    rank: GuildContractDto.rank.C,
    xpReward: 250,
    objectiveType: GuildContractDto.objectiveType.WRITE_REVIEW,
    criteria: {},
    targetGameId: null,
    targetGame: null,
    progressCurrent: 0,
    progressTarget: 1,
    status: GuildContractDto.status.ACTIVE,
    playtimeProgress: null,
    reward: null,
    event: null,
    claimPayload: null,
    acceptedAt: "2026-11-21T12:00:00.000Z",
    readyAt: null,
    claimedAt: null,
    expiresAt: "2026-11-23T03:00:00.000Z",
    createdAt: "2026-11-21T12:00:00.000Z",
    updatedAt: "2026-11-21T12:00:00.000Z",
    ...overrides,
  };
}

function makeContracts(
  contracts: GuildContractDto[],
): GuildContractsListResponseDto {
  return {
    data: contracts,
    pagination: {
      totalItems: contracts.length,
      totalPages: 1,
      hasNextPage: false,
    },
  };
}

function renderHint(length: number) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const view = render(
    <QueryClientProvider client={client}>
      <MantineProvider>
        <GuildReviewLengthHint length={length} />
      </MantineProvider>
    </QueryClientProvider>,
  );

  return { client, ...view };
}

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = "user-1";
  // The hint must never read `GET /v1/guild`: that read updates
  // `lastVisitedAt` and would swallow Lina's inactivity greeting.
  vi.spyOn(GuildService, "guildControllerGetOverviewV1").mockResolvedValue(
    {} as never,
  );
  window.matchMedia =
    window.matchMedia ||
    (vi.fn().mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as typeof window.matchMedia);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  session.userId = "user-1";
});

describe("GuildReviewLengthHint visibility", () => {
  it("stays hidden for guests and requests only the public access decision", async () => {
    session.userId = undefined;
    const access = vi
      .spyOn(GuildService, "guildControllerGetAccessV1")
      .mockResolvedValue(ACCESS_FALSE);
    const contracts = vi.spyOn(
      GuildService,
      "guildControllerListContractsV1",
    );

    const { client } = renderHint(40);

    await waitFor(() =>
      expect(client.getQueryData(guildKeys.access(null))).toBeTruthy(),
    );

    expect(access).toHaveBeenCalledTimes(1);
    expect(contracts).not.toHaveBeenCalled();
    expect(GuildService.guildControllerGetOverviewV1).not.toHaveBeenCalled();
    expect(screen.queryByText("40/80")).not.toBeInTheDocument();
    expect(
      screen.queryByText("t:guild.reviewHint.short"),
    ).not.toBeInTheDocument();
  });

  it("stays hidden for a signed-in user without access", async () => {
    const access = vi
      .spyOn(GuildService, "guildControllerGetAccessV1")
      .mockResolvedValue(ACCESS_FALSE);
    const contracts = vi.spyOn(
      GuildService,
      "guildControllerListContractsV1",
    );

    const { client } = renderHint(40);

    await waitFor(() =>
      expect(client.getQueryData(guildKeys.access("user-1"))).toBeTruthy(),
    );

    expect(access).toHaveBeenCalledTimes(1);
    expect(contracts).not.toHaveBeenCalled();
    expect(GuildService.guildControllerGetOverviewV1).not.toHaveBeenCalled();
    expect(screen.queryByText("40/80")).not.toBeInTheDocument();
  });

  it("stays hidden with access but without an active write_review contract", async () => {
    vi.spyOn(GuildService, "guildControllerGetAccessV1").mockResolvedValue(
      ACCESS_TRUE,
    );
    vi.spyOn(
      GuildService,
      "guildControllerListContractsV1",
    ).mockResolvedValue(
      makeContracts([
        makeContract({
          objectiveType: GuildContractDto.objectiveType.FINISH_GAME,
        }),
        makeContract({
          id: "contract-2",
          status: GuildContractDto.status.COMPLETED,
        }),
      ]),
    );

    const { client } = renderHint(40);

    await waitFor(() =>
      expect(
        client.getQueryData(guildKeys.contracts("user-1", "accepted")),
      ).toBeTruthy(),
    );

    expect(GuildService.guildControllerGetOverviewV1).not.toHaveBeenCalled();
    expect(screen.queryByText("40/80")).not.toBeInTheDocument();
    expect(screen.queryByText("t:guild.reviewHint.ok")).not.toBeInTheDocument();
  });
});

describe("GuildReviewLengthHint counter", () => {
  beforeEach(() => {
    vi.spyOn(GuildService, "guildControllerGetAccessV1").mockResolvedValue(
      ACCESS_TRUE,
    );
    vi.spyOn(
      GuildService,
      "guildControllerListContractsV1",
    ).mockResolvedValue(makeContracts([makeContract({})]));
  });

  it("shows 40/80 and the short-review message for a 40-character review", async () => {
    renderHint(40);

    expect(await screen.findByText("40/80")).toBeInTheDocument();
    expect(screen.getByText("t:guild.reviewHint.short")).toBeInTheDocument();
    expect(screen.queryByText("t:guild.reviewHint.ok")).not.toBeInTheDocument();
    expect(GuildService.guildControllerGetOverviewV1).not.toHaveBeenCalled();
  });

  it("shows the ok message once the trimmed review reaches 80 characters", async () => {
    renderHint(80);

    expect(await screen.findByText("80/80")).toBeInTheDocument();
    expect(screen.getByText("t:guild.reviewHint.ok")).toBeInTheDocument();
    expect(
      screen.queryByText("t:guild.reviewHint.short"),
    ).not.toBeInTheDocument();
    expect(GuildService.guildControllerGetOverviewV1).not.toHaveBeenCalled();
  });
});

describe("getReviewPlainTextLength", () => {
  it("counts the trimmed text of editor HTML, ignoring tags", () => {
    expect(getReviewPlainTextLength("<p>  abc  </p>")).toBe(3);
    expect(
      getReviewPlainTextLength("<p><strong>Hello</strong> world</p>"),
    ).toBe(11);
  });

  it("decodes HTML entities before measuring", () => {
    expect(getReviewPlainTextLength("<p>Hello &amp; welcome</p>")).toBe(15);
    expect(getReviewPlainTextLength("<p>&nbsp;abc&nbsp;</p>")).toBe(3);
  });

  it("returns zero for empty or missing content", () => {
    expect(getReviewPlainTextLength(undefined)).toBe(0);
    expect(getReviewPlainTextLength(null)).toBe(0);
    expect(getReviewPlainTextLength("")).toBe(0);
    expect(getReviewPlainTextLength("<p>   </p>")).toBe(0);
  });

  it("falls back to tag stripping when DOMParser is unavailable (SSR)", () => {
    vi.stubGlobal("DOMParser", undefined);

    expect(getReviewPlainTextLength("<p>  abc  </p>")).toBe(3);
    expect(getReviewPlainTextLength("<p>a &amp; b</p>")).toBe(5);
  });
});
