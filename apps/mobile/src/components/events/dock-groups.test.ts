// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  buildDockGroups,
  getAwardsDockItem,
  getRecapDockItem,
  type DockSeasonState,
} from "../../../../web/src/components/general/shell/navbar/dockGroups";
import {
  DOCK_GROUPS,
  type DockItemDefinition,
} from "../../../../web/src/components/general/shell/navbar/dockItems";
import {
  getRecapVisitedStorageKey,
  isRecapVisited,
  markRecapVisited,
} from "../../../../../packages/ui/src/components/recap/year/util/recapVisited";
import { useRecapVisited } from "../../../../../packages/ui/src/components/events/hooks/useRecapVisited";

vi.mock("@repo/ui", () => {
  const Icon = () => null;
  return {
    NavAchievementsIcon: Icon,
    NavActivityIcon: Icon,
    NavAiIcon: Icon,
    NavBlogIcon: Icon,
    NavCollectionsIcon: Icon,
    NavDailyIcon: Icon,
    NavExploreIcon: Icon,
    NavFeatsIcon: Icon,
    NavHomeIcon: Icon,
    NavJournalIcon: Icon,
    NavLibraryIcon: Icon,
    NavPremiumIcon: Icon,
    NavUserIcon: Icon,
    NavWrappedIcon: Icon,
  };
});

const awardsEvent = { year: 2026 } as DockSeasonState["awardsEvent"];

function season(overrides: Partial<DockSeasonState> = {}): DockSeasonState {
  return {
    awardsEntry: null,
    awardsEvent: null,
    recapEntry: null,
    recapHref: null,
    ...overrides,
  };
}

function groupItems(groups: ReturnType<typeof buildDockGroups>, id: string) {
  const group = groups.find((candidate) => candidate.id === id);
  if (!group) throw new Error(`Missing Dock group ${id}`);
  return group.items;
}

function linkedHref(item: DockItemDefinition | undefined): string | undefined {
  return item?.kind === "link" ? item.href : undefined;
}

function findItem(groups: ReturnType<typeof buildDockGroups>, id: string) {
  for (const group of groups) {
    const item = group.items.find((candidate) => candidate.id === id);
    if (item) return item;
  }
  return undefined;
}

function awardsSeason(
  phaseKind: "nominations" | "voting" | "results",
  dockBadge: "live" | "new" | null,
): DockSeasonState {
  return season({
    awardsEvent,
    awardsEntry: {
      kind: phaseKind,
      showHomeCard: true,
      dockBadge,
      href:
        phaseKind === "voting"
          ? "/awards/2026/vote"
          : phaseKind === "results"
            ? "/awards/2026/result"
            : "/awards/2026/nominations",
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("Dock seasonal groups", () => {
  it("inserts Awards right after Início with the Ao vivo badge in nominations", () => {
    const groups = buildDockGroups(awardsSeason("nominations", "live"), {
      recapVisited: false,
    });
    const discover = groupItems(groups, "discover");

    expect(discover[0].id).toBe("home");
    expect(discover[1].id).toBe("awards");
    expect(discover[1].labelKey).toBe("navigation.awards");
    expect(discover[1].labelParams).toEqual({ year: 2026 });
    expect(discover[1].badge).toBe("live");
    expect(linkedHref(discover[1])).toBe("/awards/2026/nominations");
  });

  it("sends the voting entry to the ballot with the Ao vivo badge", () => {
    const groups = buildDockGroups(awardsSeason("voting", "live"), {
      recapVisited: false,
    });
    const awards = findItem(groups, "awards");

    expect(awards?.badge).toBe("live");
    expect(linkedHref(awards)).toBe("/awards/2026/vote");
  });

  it("marks the results entry as Novo and sends it to the results screen", () => {
    const groups = buildDockGroups(awardsSeason("results", "new"), {
      recapVisited: false,
    });
    const awards = findItem(groups, "awards");

    expect(awards?.badge).toBe("new");
    expect(linkedHref(awards)).toBe("/awards/2026/result");
  });

  it.each(["nominations", "voting"] as const)(
    "keeps the Awards entry visible without a badge in a dead period (%s)",
    (kind) => {
      const groups = buildDockGroups(
        season({
          awardsEvent,
          awardsEntry: {
            kind,
            showHomeCard: false,
            dockBadge: null,
            href: `/awards/2026/${kind === "voting" ? "vote" : "nominations"}`,
          },
        }),
        { recapVisited: false },
      );
      const awards = findItem(groups, "awards");

      expect(awards).toBeTruthy();
      expect(awards?.badge).toBeUndefined();
    },
  );

  it("keeps the normal group when the Awards season is over", () => {
    const groups = buildDockGroups(season(), { recapVisited: false });
    const discover = groupItems(groups, "discover");

    expect(findItem(groups, "awards")).toBeUndefined();
    expect(discover[0].id).toBe("home");
    expect(discover[1].id).toBe("explore");
  });

  it("replaces Wrapped with Retrospectiva and the Nova badge", () => {
    const groups = buildDockGroups(
      season({
        recapEntry: { kind: "live", year: 2026 },
        recapHref: "/recap/2026/user-1",
      }),
      { recapVisited: false },
    );
    const recap = findItem(groups, "recap");

    expect(recap?.labelKey).toBe("navigation.recap");
    expect(recap?.badge).toBe("newFeminine");
    expect(linkedHref(recap)).toBe("/recap/2026/user-1");
    expect(
      groupItems(groups, "yourSpace").some((item) => item.id === "recap"),
    ).toBe(true);
  });

  it("drops the Nova badge after the first visit", () => {
    const groups = buildDockGroups(
      season({
        recapEntry: { kind: "live", year: 2026 },
        recapHref: "/recap/2026/user-1",
      }),
      { recapVisited: true },
    );

    expect(findItem(groups, "recap")?.badge).toBeUndefined();
  });

  it("restores Wrapped outside the Recap season", () => {
    const groups = buildDockGroups(season(), { recapVisited: false });
    const recap = findItem(groups, "recap");

    expect(recap?.labelKey).toBe("navigation.wrapped");
    expect(linkedHref(recap)).toBe("/recap");
  });

  it("keeps Wrapped for a visitor who has no personal Recap", () => {
    const groups = buildDockGroups(
      season({ recapEntry: { kind: "live", year: 2026 }, recapHref: null }),
      { recapVisited: false },
    );

    expect(findItem(groups, "recap")?.labelKey).toBe("navigation.wrapped");
  });

  it("does not mutate the static Dock groups", () => {
    const discoverBefore = DOCK_GROUPS[0].items.map((item) => item.id);

    buildDockGroups(awardsSeason("voting", "live"), { recapVisited: false });

    expect(DOCK_GROUPS[0].items.map((item) => item.id)).toEqual(discoverBefore);
  });

  it("returns null entries when the season has nothing to show", () => {
    const empty = season();

    expect(getAwardsDockItem(empty)).toBeNull();
    expect(getRecapDockItem(empty, { recapVisited: false })).toBeNull();
  });
});

describe("Recap visited storage", () => {
  it("marks and reads the year-scoped key", () => {
    expect(isRecapVisited(2026)).toBe(false);

    markRecapVisited(2026);

    expect(window.localStorage.getItem(getRecapVisitedStorageKey(2026))).toBe(
      "1",
    );
    expect(isRecapVisited(2026)).toBe(true);
    expect(isRecapVisited(2025)).toBe(false);
  });

  it("reads as not visited when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    expect(isRecapVisited(2026)).toBe(false);
  });

  it("re-reads the marker on a later render, so the badge clears without a reload", () => {
    const { result, rerender } = renderHook(() => useRecapVisited(2026));

    expect(result.current).toBe(false);

    act(() => markRecapVisited(2026));
    rerender();

    expect(result.current).toBe(true);
  });
});
