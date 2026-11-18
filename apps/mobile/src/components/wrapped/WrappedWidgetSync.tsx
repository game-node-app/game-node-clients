import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import {
  buildWrappedWidgetSnapshot,
  getS3StoredUpload,
  useGames,
  useRecapSummary,
  useUserId,
  useUserProfile,
  WRAPPED_WIDGET_MAX_GAMES,
} from "@repo/ui";
import { useTranslation } from "@repo/locales";
import { WrappedWidget } from "@/plugins/wrappedWidget";
import { useWidgetPeriod } from "@/components/wrapped/useWidgetPeriod";

const isAndroid = Capacitor.getPlatform() === "android";

/**
 * Keeps the Android Wrapped widgets in sync: whenever the recap summary (and
 * the covers of its top games) is loaded it writes a ready-to-render snapshot
 * to the native widgets, and clears them when the user signs out. Renders
 * nothing and does nothing outside Android.
 */
export default function WrappedWidgetSync() {
  const { t, i18n } = useTranslation();
  const userId = useUserId();
  const profileQuery = useUserProfile(userId);
  const [period] = useWidgetPeriod();
  const summaryQuery = useRecapSummary(period);
  const gamesQuery = useGames(
    {
      gameIds:
        summaryQuery.data?.topGames
          .slice(0, WRAPPED_WIDGET_MAX_GAMES)
          .map((top) => top.gameId) ?? [],
      relations: { cover: true },
    },
    false,
    "off",
  );

  const summary = summaryQuery.data;
  const games = gamesQuery.data;
  const username = profileQuery.data?.username;
  const avatar = profileQuery.data?.avatar;
  const avatarUrl = avatar
    ? getS3StoredUpload(`${avatar.filename}.${avatar.extension}`)
    : null;
  const language = i18n.language;

  // Signed out: nothing of the previous user may stay on the home screen.
  useEffect(() => {
    if (!isAndroid || userId) return;
    WrappedWidget.clear().catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (!isAndroid || !userId || !summary || !games || !username) return;
    const year = String(new Date().getFullYear());
    const isYear = period === "year";
    const periodChip = t(`mobile.wrapped.widget.period.${period}`);
    const snapshot = buildWrappedWidgetSnapshot({
      summary,
      games,
      username,
      avatarUrl,
      language,
      labels: {
        eyebrow: isYear
          ? t("mobile.wrapped.widget.eyebrow", { year })
          : `WRAPPED · ${periodChip}`,
        periodChip,
        hoursCaption: t("mobile.wrapped.widget.hoursCaption"),
        topGameBadge: t("mobile.wrapped.widget.topGameBadge"),
        top3Title: t("mobile.wrapped.widget.top3Title"),
        posterSubtitle: t("mobile.wrapped.widget.posterSubtitle"),
        posterTagline: t(`mobile.wrapped.widget.periodTagline.${period}`),
        yearChip: isYear ? year : periodChip,
        viewRecap: t("mobile.wrapped.widget.viewRecap"),
        emptyTitle: t("mobile.wrapped.widget.emptyTitle"),
        emptyBody: t("mobile.wrapped.widget.emptyBody"),
        personalityEyebrow: isYear
          ? t("mobile.wrapped.widget.personalityEyebrow", { year })
          : `${t("mobile.wrapped.widget.personalityEyebrow", { year: "" }).trim()} · ${periodChip}`,
        personality: (id) => ({
          title: t(`mobile.wrapped.widget.personality.${id}.title`),
          subtitle: t(`mobile.wrapped.widget.personality.${id}.subtitle`),
        }),
        personalityChip: (percent, genre) =>
          t("mobile.wrapped.widget.personalityChip", { percent, genre }),
        change: (change) => t("mobile.wrapped.widget.change", { change }),
        detail: (hours, percent) =>
          t("mobile.wrapped.widget.detail", { hours, percent }),
      },
    });

    // Nothing played: leave the widgets on their "open the app" state.
    const sync = snapshot
      ? WrappedWidget.update({ snapshot })
      : WrappedWidget.clear();
    sync.catch(console.error);
  }, [userId, summary, games, username, avatarUrl, language, t, period]);

  return null;
}
