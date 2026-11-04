import { expect, it } from "vitest";
import {
  computeDailyPlayStreak,
  computeDailyStats,
} from "../../../../../packages/ui/src/components/daily/util/computeDailyStats";
import { buildDailyShareText } from "../../../../../packages/ui/src/components/daily/util/buildDailyShareText";
import { toDailyLocalResult } from "../../../../../packages/ui/src/components/daily/util/toDailyLocalResult";
import type { DailyPlayResponseDto } from "../../../../../packages/wrapper/src/server";

// Noon UTC is 09:00 in São Paulo, so it lands on the same puzzle day.
const result = (date: string, status: string, attempts = 2, onTime = true) => ({
  date,
  status,
  attempts,
  finishedAt: onTime ? `${date}T12:00:00Z` : "2030-01-01T12:00:00Z",
});

it("counts played, wins and the attempt distribution", () => {
  const stats = computeDailyStats(
    [
      result("2026-11-01", "won", 1),
      result("2026-11-02", "won", 3),
      result("2026-11-03", "lost", 6),
      result("2026-11-04", "in_progress", 2),
    ],
    6,
    "2026-11-04",
  );
  expect(stats.played).toBe(3);
  expect(stats.wins).toBe(2);
  expect(stats.distribution).toEqual([1, 0, 1, 0, 0, 0]);
});

it("keeps the current streak while today is still open and resets on a loss", () => {
  const days = [
    result("2026-11-01", "lost"),
    result("2026-11-02", "won"),
    result("2026-11-03", "won"),
  ];
  expect(computeDailyStats(days, 6, "2026-11-04").currentStreak).toBe(2);
  expect(computeDailyStats(days, 6, "2026-11-03").currentStreak).toBe(2);
  expect(computeDailyStats(days, 6, "2026-11-05").currentStreak).toBe(0);
  expect(
    computeDailyStats([...days, result("2026-11-04", "lost")], 6, "2026-11-04")
      .currentStreak,
  ).toBe(0);
});

it("breaks the max streak on gaps and ignores archive plays", () => {
  const stats = computeDailyStats(
    [
      result("2026-10-01", "won"),
      result("2026-10-02", "won"),
      result("2026-10-03", "won"),
      result("2026-10-05", "won"),
      result("2026-10-04", "won", 2, false),
    ],
    6,
    "2026-11-04",
  );
  expect(stats.maxStreak).toBe(3);
  expect(stats.played).toBe(5);
});

it("builds one share line per mode with unused attempts", () => {
  expect(
    buildDailyShareText(
      [
        {
          modeLabel: "Capa",
          number: 12,
          maxAttempts: 6,
          results: ["wrong", "franchise", "correct"],
        },
        {
          modeLabel: "Especificações",
          number: 3,
          maxAttempts: 10,
          results: ["skipped", "wrong", "wrong", "wrong", "wrong", "correct"],
          hintUsed: true,
        },
      ],
      "https://gamenode.app/daily",
    ),
  ).toBe(
    [
      "🕹️ GameNode Daily",
      "Capa #12 🟥🟨🟩⬜⬜⬜",
      "Especificações #3 🟥🟥🟥🟥🟥🟩💡⬜⬜⬜",
      "https://gamenode.app/daily",
    ].join("\n"),
  );
});

it("keeps a guest's first finish time when a finished puzzle is replayed", () => {
  const response = (status: string) =>
    ({
      puzzleId: 7,
      mode: "cover",
      number: 3,
      date: "2026-11-03",
      maxAttempts: 6,
      attempts: 2,
      status,
      feedback: [
        { gameId: null, result: "skipped" },
        { gameId: 42, result: "correct" },
      ],
      hintAt: null,
    }) as unknown as DailyPlayResponseDto;

  const playing = toDailyLocalResult(response("in_progress"));
  expect(playing.finishedAt).toBeNull();
  expect(playing.guesses).toEqual([null, 42]);
  expect(playing.results).toEqual(["skipped", "correct"]);

  const won = toDailyLocalResult(response("won"), playing);
  expect(won.finishedAt).not.toBeNull();
  const replayed = toDailyLocalResult(response("won"), {
    ...won,
    finishedAt: "2026-11-03T12:00:00Z",
  });
  expect(replayed.finishedAt).toBe("2026-11-03T12:00:00Z");
});

it("counts the days in a row with any mode finished on its day", () => {
  const finished = (date: string, status = "lost") => ({
    date,
    status,
    attempts: 6,
    finishedAt: `${date}T15:00:00Z`,
  });
  // Several modes on one day count once; a loss still counts as playing.
  expect(
    computeDailyPlayStreak(
      [
        finished("2026-11-02"),
        finished("2026-11-03", "won"),
        finished("2026-11-03"),
      ],
      "2026-11-04",
    ),
  ).toBe(2);
  // Today still open doesn't break it, a missed day does.
  expect(
    computeDailyPlayStreak(
      [
        finished("2026-11-01"),
        finished("2026-11-03"),
        {
          date: "2026-11-04",
          status: "in_progress",
          attempts: 1,
          finishedAt: null,
        },
      ],
      "2026-11-04",
    ),
  ).toBe(1);
  // Archive plays finished on a later day don't count.
  expect(
    computeDailyPlayStreak(
      [
        {
          date: "2026-11-03",
          status: "won",
          attempts: 1,
          finishedAt: "2026-11-05T15:00:00Z",
        },
      ],
      "2026-11-04",
    ),
  ).toBe(0);
});
