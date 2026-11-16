import { describe, expect, it } from "vitest";
import {
  AWARDS_SEASON_DAYS_AFTER_RESULTS,
  RECAP_SEASON_DAYS_AFTER_CLOSE,
  getAwardsEntry,
  getAwardsScreenHref,
  getAwardsSeasonEnd,
  getRecapEntry,
  getRecapSeasonEnd,
  type SeasonAwardsEvent,
  type SeasonRecapWindow,
} from "../../../../../packages/ui/src/components/events/util/seasonEvents";

const RESULTS_DATE = "2026-12-27T00:00:00.000Z";
const RECAP_CLOSES_AT = "2026-12-31T23:59:59.999Z";

function awardsEvent(
  phase: SeasonAwardsEvent["phase"],
  overrides: Partial<SeasonAwardsEvent> = {},
): SeasonAwardsEvent {
  return {
    year: 2026,
    phase,
    resultsDate: RESULTS_DATE,
    ...overrides,
  };
}

function recapWindow(
  phase: SeasonRecapWindow["phase"],
  overrides: Partial<SeasonRecapWindow> = {},
): SeasonRecapWindow {
  return {
    year: 2026,
    phase,
    closesAt: RECAP_CLOSES_AT,
    ...overrides,
  };
}

const created = { isRecapCreated: true };
const notCreated = { isRecapCreated: false };

describe("season constants", () => {
  it("keeps the 27 Jan boundary of the design calendar", () => {
    expect(AWARDS_SEASON_DAYS_AFTER_RESULTS).toBe(31);
    expect(RECAP_SEASON_DAYS_AFTER_CLOSE).toBe(27);

    expect(getAwardsSeasonEnd(RESULTS_DATE).toISOString()).toBe(
      "2027-01-27T23:59:59.999Z",
    );
    expect(getRecapSeasonEnd(RECAP_CLOSES_AT).toISOString()).toBe(
      "2027-01-27T23:59:59.999Z",
    );
    // A closesAt stored at midnight still includes the whole 27th.
    expect(getRecapSeasonEnd("2026-12-31T00:00:00.000Z").toISOString()).toBe(
      "2027-01-27T23:59:59.999Z",
    );
  });
});

describe("getAwardsScreenHref", () => {
  it("maps every phase to its screen (spec: Destino por fase)", () => {
    expect(getAwardsScreenHref(2026, "upcoming")).toBe(
      "/awards/2026/nominations",
    );
    expect(getAwardsScreenHref(2026, "nominations")).toBe(
      "/awards/2026/nominations",
    );
    expect(getAwardsScreenHref(2026, "nominations_closed")).toBe(
      "/awards/2026/nominations",
    );
    expect(getAwardsScreenHref(2026, "voting")).toBe("/awards/2026/vote");
    expect(getAwardsScreenHref(2026, "voting_closed")).toBe(
      "/awards/2026/vote",
    );
    expect(getAwardsScreenHref(2026, "results")).toBe("/awards/2026/result");
  });
});

describe("getAwardsEntry period table", () => {
  const now = new Date("2026-11-16T12:00:00.000Z");

  it("has no entry before an event or in the upcoming phase", () => {
    expect(getAwardsEntry(null, undefined, undefined, now)).toBeNull();
    expect(
      getAwardsEntry(awardsEvent("upcoming"), undefined, undefined, now),
    ).toBeNull();
  });

  it("shows the nominations card and the live badge", () => {
    expect(
      getAwardsEntry(awardsEvent("nominations"), undefined, undefined, now),
    ).toEqual({
      kind: "nominations",
      showHomeCard: true,
      dockBadge: "live",
      href: "/awards/2026/nominations",
    });
  });

  it("keeps the Dock entry without badge in the nominations dead period", () => {
    expect(
      getAwardsEntry(
        awardsEvent("nominations_closed"),
        undefined,
        undefined,
        now,
      ),
    ).toEqual({
      kind: "nominations",
      showHomeCard: false,
      dockBadge: null,
      href: "/awards/2026/nominations",
    });
  });

  it("shows the voting card while the ballot is incomplete", () => {
    expect(
      getAwardsEntry(
        awardsEvent("voting"),
        { categoriesVoted: 7, categoriesTotal: 12 },
        undefined,
        now,
      ),
    ).toEqual({
      kind: "voting",
      showHomeCard: true,
      dockBadge: "live",
      href: "/awards/2026/vote",
    });
  });

  it("hides the voting card once the ballot is complete", () => {
    expect(
      getAwardsEntry(
        awardsEvent("voting"),
        { categoriesVoted: 12, categoriesTotal: 12 },
        undefined,
        now,
      ),
    ).toEqual({
      kind: "voting",
      showHomeCard: false,
      dockBadge: "live",
      href: "/awards/2026/vote",
    });
  });

  it("shows the voting card to visitors, who have no ballot", () => {
    expect(
      getAwardsEntry(awardsEvent("voting"), undefined, undefined, now),
    ).toEqual({
      kind: "voting",
      showHomeCard: true,
      dockBadge: "live",
      href: "/awards/2026/vote",
    });
  });

  it("falls back to the categories length for old ballots", () => {
    const categories = Array.from({ length: 12 }, () => ({}));

    expect(
      getAwardsEntry(
        awardsEvent("voting"),
        { categoriesVoted: 12, categoriesTotal: 0 },
        categories,
        now,
      )?.showHomeCard,
    ).toBe(false);
  });

  it("keeps the Dock entry without badge in the voting dead period", () => {
    expect(
      getAwardsEntry(
        awardsEvent("voting_closed"),
        { categoriesVoted: 12, categoriesTotal: 12 },
        undefined,
        now,
      ),
    ).toEqual({
      kind: "voting",
      showHomeCard: false,
      dockBadge: null,
      href: "/awards/2026/vote",
    });
  });

  it("shows the result card with the new badge through 27 Jan", () => {
    expect(
      getAwardsEntry(
        awardsEvent("results"),
        undefined,
        undefined,
        new Date("2027-01-10T12:00:00.000Z"),
      ),
    ).toEqual({
      kind: "results",
      showHomeCard: true,
      dockBadge: "new",
      href: "/awards/2026/result",
    });

    expect(
      getAwardsEntry(
        awardsEvent("results"),
        undefined,
        undefined,
        new Date("2027-01-27T23:59:59.999Z"),
      ),
    ).not.toBeNull();
  });

  it("drops the entry after 31 days (28 Jan onward)", () => {
    expect(
      getAwardsEntry(
        awardsEvent("results"),
        undefined,
        undefined,
        new Date("2027-01-28T00:00:00.000Z"),
      ),
    ).toBeNull();

    expect(
      getAwardsEntry(
        awardsEvent("results"),
        undefined,
        undefined,
        new Date("2027-01-28T12:00:00.000Z"),
      ),
    ).toBeNull();
  });
});

describe("getRecapEntry period table", () => {
  const liveNow = new Date("2026-11-16T12:00:00.000Z");

  it("has no entry in the upcoming phase", () => {
    expect(getRecapEntry(recapWindow("upcoming"), created, liveNow)).toBeNull();
  });

  it("shows the live entry only for a created Recap", () => {
    expect(getRecapEntry(recapWindow("live"), created, liveNow)).toEqual({
      kind: "live",
      year: 2026,
    });
    expect(getRecapEntry(recapWindow("live"), notCreated, liveNow)).toBeNull();
  });

  it("does not show a teaser while the status is still loading", () => {
    expect(getRecapEntry(recapWindow("live"), undefined, liveNow)).toBeNull();
  });

  it("shows the live teaser to visitors", () => {
    expect(getRecapEntry(recapWindow("live"), null, liveNow)).toEqual({
      kind: "live",
      year: 2026,
    });
  });

  it("shows the closed entry through 27 Jan", () => {
    const january = new Date("2027-01-10T12:00:00.000Z");

    expect(getRecapEntry(recapWindow("closed"), created, january)).toEqual({
      kind: "closed",
      year: 2026,
    });
    expect(
      getRecapEntry(
        recapWindow("closed"),
        created,
        new Date("2027-01-27T23:59:59.999Z"),
      ),
    ).not.toBeNull();
  });

  it("drops the closed entry after 27 days (28 Jan onward)", () => {
    expect(
      getRecapEntry(
        recapWindow("closed"),
        created,
        new Date("2027-01-28T00:00:00.000Z"),
      ),
    ).toBeNull();
  });

  it("has no closed entry without a created Recap or without a session", () => {
    const january = new Date("2027-01-10T12:00:00.000Z");

    expect(
      getRecapEntry(recapWindow("closed"), notCreated, january),
    ).toBeNull();
    expect(getRecapEntry(recapWindow("closed"), null, january)).toBeNull();
    expect(getRecapEntry(recapWindow("closed"), undefined, january)).toBeNull();
  });

  it("has no entry before the year opens (previous year closed)", () => {
    const beforeOpening = new Date("2026-11-10T12:00:00.000Z");

    expect(
      getRecapEntry(
        recapWindow("closed", {
          year: 2025,
          closesAt: "2025-12-31T23:59:59.999Z",
        }),
        created,
        beforeOpening,
      ),
    ).toBeNull();
  });
});
