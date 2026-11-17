import { Button, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconArrowRight, IconTrophy } from "@tabler/icons-react";
import type { DailyRankingSummaryDto } from "@repo/wrapper/server";
import {
  formatDailyCount,
  formatDailyPoints,
} from "#@/components/daily/ranking/rankingFormat";
import { cn } from "#@/util/cn";
import { Link } from "#@/util/link";

/**
 * What a finished daily play did to the viewer's week ranking (frame 5051:14093).
 * Renders nothing without a ranking block (guests, weekly plays).
 */
const DailyRankingResultCard = ({
  ranking,
}: {
  ranking: DailyRankingSummaryDto | undefined;
}) => {
  const { t, i18n } = useTranslation();
  if (!ranking) return null;
  const language = i18n?.language ?? "en";
  const pts = (value: number) => formatDailyPoints(value, language);
  const {
    counted,
    pointsEarned,
    bonusEarned,
    weekPoints,
    weekPosition,
    previousWeekPosition,
    pointsToTop100,
  } = ranking;

  let title: string;
  let subtitle: string[];
  if (counted) {
    const earned = t("daily.ranking.result.points", {
      points: pts(pointsEarned + bonusEarned),
    });
    const position =
      weekPosition == null
        ? undefined
        : formatDailyCount(weekPosition, language);
    const move =
      position == undefined
        ? undefined
        : previousWeekPosition == null
          ? t("daily.ranking.result.entered", { position })
          : previousWeekPosition > weekPosition!
            ? t("daily.ranking.result.rose", { position })
            : t("daily.ranking.result.same", { position });
    title = move ? `${earned} · ${move}` : earned;
    subtitle = [t("daily.ranking.result.week", { points: pts(weekPoints) })];
    if (pointsToTop100 != null) {
      subtitle.push(
        t("daily.ranking.summary.gap", { points: pts(pointsToTop100) }),
      );
    }
    if (bonusEarned > 0) {
      subtitle.push(
        t("daily.ranking.result.bonus", { points: pts(bonusEarned) }),
      );
    }
  } else {
    title = t("daily.ranking.result.notCounted");
    subtitle = [t("daily.ranking.result.notCountedDescription")];
  }

  return (
    <div
      data-counted={counted}
      className={cn(
        "flex flex-wrap items-center gap-3.5 rounded-[14px] border border-solid p-[18px]",
        counted
          ? "border-brand-5 bg-nav-accent-subtle"
          : "border-line bg-paper-8",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-nav-canvas",
          counted ? "text-brand-5" : "text-[#7A7A7A]",
        )}
      >
        <IconTrophy size={22} aria-hidden />
      </span>
      <div className={"flex min-w-[200px] flex-1 flex-col gap-0.5"}>
        <Text fz={16} fw={700} c={counted ? "white" : "#ADADAD"}>
          {title}
        </Text>
        <Text fz={13} c={"#ADADAD"}>
          {subtitle.join(" ")}
        </Text>
      </div>
      <Button
        component={Link}
        href={"/daily/ranking"}
        variant={"default"}
        radius={8}
        h={40}
        px={16}
        fz={14}
        rightSection={<IconArrowRight size={16} />}
        className={"!border-line !bg-transparent"}
      >
        {t("daily.ranking.result.see")}
      </Button>
    </div>
  );
};

export { DailyRankingResultCard };
