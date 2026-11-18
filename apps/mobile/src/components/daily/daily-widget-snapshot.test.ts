import { describe, expect, it } from "vitest";
import {
  buildDailyWidgetSnapshot,
  type DailyWidgetLabels,
} from "../../../../../packages/ui/src/components/daily/util/dailyWidgetSnapshot";

const labels: DailyWidgetLabels = {
  eyebrow: "GAMENODE DAILY",
  titlePending: "What's today's game?",
  cta: "Play now",
  countdownFormat: "Next in %s",
  emptyTitle: "GameNode Daily",
  emptyBody: "Open GameNode",
  titlePlayed: (won, total) => `${won} of ${total} solved`,
  streak: (days) => `${days} day streak`,
  streakChip: (days) => `${days} days`,
};

const RESET = "2026-11-19T03:00:00.000Z";
const result = (status: string) => ({ result: { status } });

describe("buildDailyWidgetSnapshot", () => {
  it("is pending until a puzzle is started", () => {
    const snapshot = buildDailyWidgetSnapshot({
      entries: [{}, {}, {}, {}],
      streak: 7,
      nextResetAt: RESET,
      labels,
      now: 5,
    })!;

    expect(snapshot.state).toBe("pending");
    expect(snapshot.updatedAt).toBe(5);
    expect(snapshot.nextResetAt).toBe(Date.parse(RESET));
    expect(snapshot.puzzles.map((p) => p.status)).toEqual([
      "none",
      "none",
      "none",
      "none",
    ]);
    expect(snapshot.strings.title).toBe("What's today's game?");
    expect(snapshot.strings.streakChip).toBe("7 days");
  });

  it("summarises what was played today and keeps each puzzle's status", () => {
    const snapshot = buildDailyWidgetSnapshot({
      entries: [result("won"), result("lost"), result("in_progress"), {}],
      streak: 3,
      nextResetAt: RESET,
      labels,
    })!;

    expect(snapshot.state).toBe("played");
    expect(snapshot.puzzles.map((p) => p.status)).toEqual([
      "won",
      "lost",
      "in_progress",
      "none",
    ]);
    expect(snapshot.strings.title).toBe("1 of 4 solved");
    expect(snapshot.strings.subtitle).toBe("3 day streak");
  });

  it("leaves out the streak when there is none", () => {
    const snapshot = buildDailyWidgetSnapshot({
      entries: [result("won")],
      streak: 0,
      nextResetAt: RESET,
      labels,
    })!;

    expect(snapshot.strings.subtitle).toBeNull();
    expect(snapshot.strings.streakChip).toBeNull();
  });

  it("returns null without puzzles or with an unusable reset time", () => {
    expect(
      buildDailyWidgetSnapshot({
        entries: [],
        streak: 0,
        nextResetAt: RESET,
        labels,
      }),
    ).toBeNull();
    expect(
      buildDailyWidgetSnapshot({
        entries: [{}],
        streak: 0,
        nextResetAt: "not a date",
        labels,
      }),
    ).toBeNull();
  });
});
