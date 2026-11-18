import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import {
  buildDailyWidgetSnapshot,
  computeDailyPlayStreak,
  toSaoPauloDate,
  useDailyResults,
  useDailyTodayResults,
  useUserId,
} from "@repo/ui";
import { useTranslation } from "@repo/locales";
import { WrappedWidget } from "@/plugins/wrappedWidget";

const isAndroid = Capacitor.getPlatform() === "android";

/**
 * Keeps the Android GameNode Daily widget in sync with today's puzzles, the
 * player's results and streak (the account's when signed in, else the device's).
 * Renders nothing and does nothing outside Android.
 */
export default function DailyWidgetSync() {
  const { t } = useTranslation();
  const userId = useUserId();
  const { todayQuery, entries } = useDailyTodayResults();
  const resultsQuery = useDailyResults();

  const today = todayQuery.data;
  const results = resultsQuery.data?.data;
  // Entries are rebuilt on every render; this is what actually changes them.
  const entriesKey = entries
    .map((entry) => `${entry.puzzle.id}:${entry.result?.status ?? "none"}`)
    .join(",");

  useEffect(() => {
    if (!isAndroid || !today) return;
    // Streaks need the account's history; guests just don't get one.
    const streak =
      userId && results
        ? computeDailyPlayStreak(results, today.date ?? toSaoPauloDate(new Date()))
        : 0;

    const snapshot = buildDailyWidgetSnapshot({
      entries,
      streak,
      nextResetAt: today.nextResetAt,
      labels: {
        eyebrow: t("daily.widget.eyebrow"),
        titlePending: t("daily.widget.titlePending"),
        cta: t("daily.widget.cta"),
        countdownFormat: t("daily.widget.countdown"),
        emptyTitle: t("daily.widget.emptyTitle"),
        emptyBody: t("daily.widget.emptyBody"),
        titlePlayed: (won, total) =>
          t("daily.widget.titlePlayed", { won, total }),
        streak: (count) => t("daily.widget.streak", { count }),
        streakChip: (count) => t("daily.widget.streakChip", { count }),
      },
    });

    const sync = snapshot
      ? WrappedWidget.updateDaily({ snapshot })
      : WrappedWidget.clearDaily();
    sync.catch(console.error);
    // `entries` is rebuilt each render, `entriesKey` stands in for its content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, today, results, entriesKey, t]);

  return null;
}
