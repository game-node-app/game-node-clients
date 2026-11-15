import { describe, expect, it } from "vitest";
import type {
  AchievementEventDto,
  AchievementTierV2Dto,
  AchievementV2Dto,
} from "../../../../../packages/wrapper/src/server";
import type {
  FeatProgress,
  FeatsTranslator,
} from "../../../../../packages/ui/src/components/achievement/util/feats";
import {
  buildFeatsModel,
  filterFeats,
  formatFeatAmount,
  formatFeatDate,
  formatFeatNumber,
  getFeatMetricUnitKey,
} from "../../../../../packages/ui/src/components/achievement/util/feats";

const NOW = Date.parse("2026-11-14T12:00:00Z");

const tier = (
  level: number,
  threshold: number,
  expReward: number,
): AchievementTierV2Dto => ({
  level,
  threshold,
  expReward,
  obtainedCount: 0,
  rarity: 0.1,
});

const feat = (
  id: string,
  overrides: Partial<AchievementV2Dto> = {},
): AchievementV2Dto => ({
  id,
  name: id,
  description: "",
  category: 0,
  criteria: null,
  isHidden: false,
  metric: null,
  icon: null,
  event: null,
  startsAt: null,
  endsAt: null,
  tiers: [tier(1, 10, 10)],
  ...overrides,
});

const event = (
  id: string,
  startsAt: string,
  endsAt: string,
): AchievementEventDto => ({
  id,
  slug: id,
  name: id,
  description: `${id} description`,
  startsAt,
  endsAt,
});

const progress = (
  achievementId: string,
  overrides: Partial<FeatProgress> = {},
): FeatProgress => ({
  achievementId,
  value: 0,
  tier: 0,
  nextThreshold: null,
  ...overrides,
});

describe("buildFeatsModel", () => {
  it("summarizes obtained feats, tiers and XP from every obtained tier", () => {
    const achievements = [
      feat("multi-tier", {
        tiers: [tier(1, 10, 10), tier(2, 25, 25), tier(3, 50, 50)],
      }),
      feat("single-tier", { tiers: [tier(1, 10, 40)] }),
      ...Array.from({ length: 22 }, (_, index) => feat(`locked-${index}`)),
    ];

    const model = buildFeatsModel({
      achievements,
      progress: [
        progress("multi-tier", { value: 50, tier: 3 }),
        progress("single-tier", { value: 10, tier: 1 }),
      ],
      now: NOW,
    });

    expect(model.summary).toEqual({
      obtainedCount: 2,
      total: 24,
      tiersCount: 4,
      featXp: 125,
    });
  });

  it("derives the state and next tier of every card", () => {
    const achievements = [
      feat("critics-corner", {
        tiers: [
          tier(1, 10, 10),
          tier(2, 50, 25),
          tier(3, 100, 50),
          tier(4, 250, 100),
          tier(5, 500, 200),
          tier(6, 1000, 500),
        ],
      }),
      feat("test-lab", { tiers: [tier(1, 10, 50)] }),
      feat("secret-feat", {
        isHidden: true,
        name: null,
        description: null,
        icon: null,
      }),
      feat("completed-feat", { tiers: [tier(1, 10, 100)] }),
    ];

    const model = buildFeatsModel({
      achievements,
      progress: [
        progress("critics-corner", {
          value: 61,
          tier: 3,
          nextThreshold: 250,
        }),
        progress("test-lab", { value: 8, nextThreshold: 10 }),
        progress("completed-feat", { value: 10, tier: 1 }),
      ],
      now: NOW,
    });

    const critics = model.items.find(
      (item) => item.achievement.id === "critics-corner",
    )!;
    expect(critics.state).toBe("obtained");
    expect(critics.displayTier).toBe(3);
    expect(critics.nextTier?.level).toBe(4);
    expect(critics.nextTier?.expReward).toBe(100);
    expect(critics.nextThreshold).toBe(250);
    expect(critics.earnedXp).toBe(85);

    const testLab = model.items.find(
      (item) => item.achievement.id === "test-lab",
    )!;
    expect(testLab.state).toBe("locked");
    expect(testLab.displayTier).toBe(1);
    expect(testLab.nextTier?.level).toBe(1);
    expect(testLab.nextTier?.expReward).toBe(50);
    expect(testLab.nextThreshold).toBe(10);
    expect(testLab.earnedXp).toBe(0);

    const secret = model.items.find(
      (item) => item.achievement.id === "secret-feat",
    )!;
    expect(secret.state).toBe("secret");

    const completed = model.items.find(
      (item) => item.achievement.id === "completed-feat",
    )!;
    expect(completed.state).toBe("complete");
    expect(completed.nextTier).toBeUndefined();
    expect(completed.nextThreshold).toBeNull();
    expect(completed.earnedXp).toBe(100);
  });

  it("ranks almost-there feats by ratio and keeps catalog order on ties", () => {
    const almostThereCases = [
      { id: "eight-of-ten", value: 8, threshold: 10 },
      { id: "four-of-five", value: 4, threshold: 5 },
      { id: "twenty-one-of-twenty-five", value: 21, threshold: 25 },
      { id: "two-of-fifty", value: 2, threshold: 50 },
    ];
    const achievements = [
      ...almostThereCases.map((item) =>
        feat(item.id, { tiers: [tier(1, item.threshold, 10)] }),
      ),
      feat("secret-at-nine", {
        isHidden: true,
        name: null,
        description: null,
        tiers: [tier(1, 10, 10)],
      }),
      feat("completed", { tiers: [tier(1, 10, 10)] }),
      feat("past-event-feat", {
        tiers: [tier(1, 10, 10)],
        event: event(
          "past-event",
          "2026-10-01T00:00:00Z",
          "2026-11-01T00:00:00Z",
        ),
      }),
    ];

    const model = buildFeatsModel({
      achievements,
      progress: [
        ...almostThereCases.map((item) =>
          progress(item.id, {
            value: item.value,
            nextThreshold: item.threshold,
          }),
        ),
        progress("secret-at-nine", { value: 9, nextThreshold: 10 }),
        progress("completed", { value: 10, tier: 1 }),
        progress("past-event-feat", { value: 9, nextThreshold: 10 }),
      ],
      now: NOW,
    });

    expect(model.almostThere.map((item) => item.achievement.id)).toEqual([
      "twenty-one-of-twenty-five",
      "eight-of-ten",
      "four-of-five",
    ]);
  });

  it("keeps ended-event feats only when obtained and hides upcoming events", () => {
    const activeEvent = event(
      "active-event",
      "2026-11-01T00:00:00Z",
      "2026-12-01T00:00:00Z",
    );
    const pastEvent = event(
      "past-event",
      "2026-10-01T00:00:00Z",
      "2026-11-01T00:00:00Z",
    );
    const emptyPastEvent = event(
      "empty-event",
      "2026-09-01T00:00:00Z",
      "2026-10-01T00:00:00Z",
    );
    const upcomingEvent = event(
      "upcoming-event",
      "2026-12-01T00:00:00Z",
      "2027-01-01T00:00:00Z",
    );

    const achievements = [
      feat("regular-feat"),
      feat("past-won", {
        event: pastEvent,
        tiers: [tier(1, 1, 1000)],
      }),
      feat("past-missed", {
        event: pastEvent,
        tiers: [tier(1, 1, 500)],
      }),
      feat("empty-missed", {
        event: emptyPastEvent,
        tiers: [tier(1, 1, 500)],
      }),
      feat("active-won", {
        event: activeEvent,
        tiers: [tier(1, 1, 40)],
      }),
      feat("active-locked", {
        event: activeEvent,
        tiers: [tier(1, 1, 40)],
      }),
      feat("upcoming-won", {
        event: upcomingEvent,
        tiers: [tier(1, 1, 999)],
      }),
    ];

    const model = buildFeatsModel({
      achievements,
      progress: [
        progress("past-won", { value: 1, tier: 1 }),
        progress("active-won", { value: 1, tier: 1 }),
        progress("upcoming-won", { value: 1, tier: 1 }),
      ],
      now: NOW,
    });

    expect(model.items.map((item) => item.achievement.id)).toEqual([
      "regular-feat",
      "past-won",
      "active-won",
      "active-locked",
    ]);
    expect(model.summary).toEqual({
      obtainedCount: 2,
      total: 4,
      tiersCount: 2,
      featXp: 1040,
    });

    expect(model.events.map((group) => group.id)).toEqual([
      "active-event",
      "past-event",
    ]);
    expect(model.events[1].isPast).toBe(true);
    expect(model.events[1].obtainedCount).toBe(1);
    expect(model.events[1].earnedXp).toBe(1000);

    expect(model.pastEvents.map((group) => group.id)).toEqual([
      "past-event",
      "empty-event",
    ]);
    const pastItems = model.pastEvents[0].items;
    expect(pastItems.map((item) => item.achievement.id)).toEqual([
      "past-won",
      "past-missed",
    ]);
    expect(pastItems[0].state).toBe("complete");
    expect(pastItems[1].state).toBe("locked");
    expect(pastItems[1].isPastEvent).toBe(true);
  });
});

describe("filterFeats", () => {
  const achievements = [
    feat("follow-locked", { category: 1, name: "Follower feat" }),
    feat("follow-obtained", { category: 1, name: "Followed" }),
    feat("follow-dragon", { category: 1, name: "Dragon follower" }),
    feat("review-locked", { category: 2, name: "Review feat" }),
    feat("dragon", {
      category: 0,
      name: "Backlog Dragon",
      description: "Finish a dragon game",
    }),
    feat("accent", {
      category: 0,
      name: "Dragón",
      description: "Um dragão lendário",
    }),
    feat("secret", {
      category: 4,
      isHidden: true,
      name: "Dragon secret",
      description: "dragon",
    }),
  ];

  const items = buildFeatsModel({
    achievements,
    progress: [progress("follow-obtained", { value: 1, tier: 1 })],
    now: NOW,
  }).items;

  it("combines category and status", () => {
    expect(
      filterFeats(items, { category: 1, status: "locked" }).map(
        (item) => item.achievement.id,
      ),
    ).toEqual(["follow-locked", "follow-dragon"]);
  });

  it("combines category, status and search", () => {
    expect(
      filterFeats(items, {
        category: 1,
        status: "locked",
        query: "dragon",
      }).map((item) => item.achievement.id),
    ).toEqual(["follow-dragon"]);
  });

  it("filters by status", () => {
    expect(
      filterFeats(items, { status: "obtained" }).map(
        (item) => item.achievement.id,
      ),
    ).toEqual(["follow-obtained"]);
  });

  it("searches without case or accents and skips masked secrets", () => {
    expect(
      filterFeats(items, { query: "DRAGON" }).map(
        (item) => item.achievement.id,
      ),
    ).toEqual(["follow-dragon", "dragon", "accent"]);
    expect(
      filterFeats(items, { query: "dragao" }).map(
        (item) => item.achievement.id,
      ),
    ).toEqual(["accent"]);
  });
});

describe("formatting", () => {
  const units: Record<string, { one: string; other: string }> = {
    "achievements.units.games": { one: "jogo", other: "jogos" },
    "achievements.units.reviews": { one: "review", other: "reviews" },
    "achievements.units.followers": { one: "seguidor", other: "seguidores" },
    "achievements.units.comments": { one: "comentário", other: "comentários" },
  };
  const t = ((key: string, options?: { count?: number }) => {
    const unit = units[key];
    if (!unit) throw new Error(`Unknown unit key: ${key}`);
    return options?.count === 1 ? unit.one : unit.other;
  }) as unknown as FeatsTranslator;

  it("formats metric amounts with pluralized units", () => {
    expect(
      formatFeatAmount(1000, {
        locale: "pt-BR",
        metric: "library_games",
        t,
      }),
    ).toBe("1.000 jogos");
    expect(
      formatFeatAmount(1, { locale: "pt-BR", metric: "library_games", t }),
    ).toBe("1 jogo");
    expect(
      formatFeatAmount(1000, {
        locale: "en",
        metric: "reviews_written",
        t,
      }),
    ).toBe("1,000 reviews");
  });

  it("falls back to a plain localized number for unknown metrics", () => {
    expect(
      formatFeatAmount(1000, {
        locale: "pt-BR",
        metric: "unknown_metric",
        t,
      }),
    ).toBe("1.000");
    expect(getFeatMetricUnitKey("manual")).toBeUndefined();
    expect(getFeatMetricUnitKey("followers")).toBe(
      "achievements.units.followers",
    );
  });

  it("formats numbers and dates for the active locale", () => {
    expect(formatFeatNumber(1000, "pt-BR")).toBe("1.000");
    const date = new Date(2025, 10, 3, 12);
    expect(formatFeatDate(date, "pt-BR")).toBe("03/11/2025");
    expect(formatFeatDate(date, "en-US")).toBe("11/03/2025");
  });
});
