// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  AwardsService,
  RecapService,
  type AwardsBallotDto,
  type CurrentAwardsEventDto,
  type RecapCurrentDto,
  type RecapStatusDto,
} from "@repo/wrapper/server";
import { useSeasonEvents } from "../../../../../packages/ui/src/components/events/hooks/useSeasonEvents";

const session = vi.hoisted(() => ({
  userId: undefined as string | undefined,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.userId }),
);

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

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
    resultsDate: "2026-12-27T00:00:00.000Z",
    nominationStartDate: "2026-11-20T00:00:00.000Z",
    nominationEndDate: "2026-11-28T23:59:59.000Z",
    eligibilityCutoffDate: "2026-11-30T00:00:00.000Z",
  } as unknown as CurrentAwardsEventDto;
}

function ballot(
  categoriesVoted: number,
  categoriesTotal: number,
): AwardsBallotDto {
  return {
    eventId: 12,
    year: 2026,
    phase: "voting",
    categoriesVoted,
    categoriesTotal,
    categories: [],
  } as unknown as AwardsBallotDto;
}

function recapWindow(phase: string): RecapCurrentDto {
  return {
    year: 2026,
    phase,
    opensAt: "2026-11-15T00:00:00.000Z",
    closesAt: "2026-12-31T23:59:59.999Z",
  } as unknown as RecapCurrentDto;
}

function recapStatus(isRecapCreated: boolean): RecapStatusDto {
  return {
    isRecapCreated,
    isRecapEligible: true,
    phase: "live",
  } as unknown as RecapStatusDto;
}

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = undefined;

  vi.spyOn(
    AwardsService,
    "awardsControllerGetCategoriesByEventIdV1",
  ).mockResolvedValue([]);
  vi.spyOn(RecapService, "recapControllerGetCurrentRecapV1").mockResolvedValue(
    recapWindow("live"),
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.userId = undefined;
});

describe("useSeasonEvents", () => {
  it("keeps the ballot unread for visitors and exposes the live Recap teaser", async () => {
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCurrentEventV1",
    ).mockResolvedValue(currentEvent("voting"));
    const getBallot = vi.spyOn(
      AwardsService,
      "awardsBallotControllerGetBallotV1",
    );
    const getStatus = vi.spyOn(RecapService, "recapControllerGetRecapStatusV1");

    const hook = renderHook(() => useSeasonEvents(), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    expect(getBallot).not.toHaveBeenCalled();
    expect(getStatus).not.toHaveBeenCalled();
    expect(hook.result.current.awardsEntry).toEqual({
      kind: "voting",
      showHomeCard: true,
      dockBadge: "live",
      href: "/awards/2026/vote",
    });
    expect(hook.result.current.recapEntry).toEqual({
      kind: "live",
      year: 2026,
    });
    expect(hook.result.current.recapHref).toBeNull();
  });

  it("reads the ballot in voting and hides the card when it is complete", async () => {
    session.userId = "user-1";
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCurrentEventV1",
    ).mockResolvedValue(currentEvent("voting"));
    const getBallot = vi
      .spyOn(AwardsService, "awardsBallotControllerGetBallotV1")
      .mockResolvedValue(ballot(12, 12));
    vi.spyOn(RecapService, "recapControllerGetRecapStatusV1").mockResolvedValue(
      recapStatus(true),
    );

    const hook = renderHook(() => useSeasonEvents(), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() =>
      expect(hook.result.current.awardsEntry?.showHomeCard).toBe(false),
    );

    expect(getBallot).toHaveBeenCalledTimes(1);
    expect(hook.result.current.awardsBallot?.categoriesVoted).toBe(12);
    expect(hook.result.current.recapEntry).toEqual({
      kind: "live",
      year: 2026,
    });
    expect(hook.result.current.recapHref).toBe("/recap/2026/user-1");
  });

  it("does not read the ballot or the categories outside the voting phase", async () => {
    session.userId = "user-1";
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCurrentEventV1",
    ).mockResolvedValue(currentEvent("nominations"));
    const getBallot = vi.spyOn(
      AwardsService,
      "awardsBallotControllerGetBallotV1",
    );
    const getCategories = vi.spyOn(
      AwardsService,
      "awardsControllerGetCategoriesByEventIdV1",
    );
    vi.spyOn(RecapService, "recapControllerGetRecapStatusV1").mockResolvedValue(
      recapStatus(false),
    );

    const hook = renderHook(() => useSeasonEvents(), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    expect(getBallot).not.toHaveBeenCalled();
    expect(getCategories).not.toHaveBeenCalled();
    expect(hook.result.current.awardsEntry).toEqual({
      kind: "nominations",
      showHomeCard: true,
      dockBadge: "live",
      href: "/awards/2026/nominations",
    });
    expect(hook.result.current.recapEntry).toBeNull();
    expect(hook.result.current.recapHref).toBeNull();
  });

  it("drops both entries after the season ends", async () => {
    session.userId = "user-1";
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCurrentEventV1",
    ).mockResolvedValue({
      ...currentEvent("results"),
      year: 2020,
      resultsDate: "2020-12-27T00:00:00.000Z",
    } as unknown as CurrentAwardsEventDto);
    vi.spyOn(
      AwardsService,
      "awardsBallotControllerGetBallotV1",
    ).mockResolvedValue(ballot(12, 12));
    vi.spyOn(
      RecapService,
      "recapControllerGetCurrentRecapV1",
    ).mockResolvedValue({
      ...recapWindow("closed"),
      year: 2020,
      opensAt: "2020-11-15T00:00:00.000Z",
      closesAt: "2020-12-31T23:59:59.999Z",
    } as unknown as RecapCurrentDto);
    vi.spyOn(RecapService, "recapControllerGetRecapStatusV1").mockResolvedValue(
      recapStatus(true),
    );

    const hook = renderHook(() => useSeasonEvents(), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    expect(hook.result.current.awardsEntry).toBeNull();
    expect(hook.result.current.recapEntry).toBeNull();
    expect(hook.result.current.recapHref).toBeNull();
  });
});
