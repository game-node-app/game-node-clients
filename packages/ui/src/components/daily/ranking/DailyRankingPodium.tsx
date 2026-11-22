import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconFlame, IconPlus } from "@tabler/icons-react";
import type { DailyRankingRowDto } from "@repo/wrapper/server";
import {
  DailyRankingAvatar,
  DailyRankingBadge,
} from "#@/components/daily/ranking/DailyRankingParts";
import { formatDailyPoints } from "#@/components/daily/ranking/rankingFormat";
import { cn } from "#@/util/cn";
import { Link } from "#@/util/link";

/** Gold, silver and bronze, from the frame. */
const MEDAL_COLORS = ["#F5C542", "#C9CED6", "#D08A54"];

/** Card heights by place (card layout, table layout). */
const HEIGHTS = [
  "h-[170px] @[720px]:h-[250px]",
  "h-[150px] @[720px]:h-[214px]",
  "h-[140px] @[720px]:h-[200px]",
];

const Medal = ({ place }: { place: number }) => (
  <span
    className={
      "flex h-[22px] w-[22px] items-center justify-center rounded-full text-[12px] font-bold text-[#0B0B0B] @[720px]:h-7 @[720px]:w-7 @[720px]:text-[13px]"
    }
    style={{ backgroundColor: MEDAL_COLORS[place - 1] }}
  >
    {place}
  </span>
);

const cardClass = (place: number) =>
  cn(
    "flex w-[116px] min-w-0 flex-col items-center justify-end gap-1 rounded-[12px] border border-solid bg-paper-8 px-1.5 py-3",
    "@[720px]:w-[220px] @[720px]:gap-2 @[720px]:rounded-[14px] @[720px]:px-4 @[720px]:py-5",
    place === 1 ? "border-brand-5" : "border-line",
    HEIGHTS[place - 1],
  );

const PodiumPlayer = ({
  row,
  place,
  isOverall,
}: {
  row: DailyRankingRowDto;
  place: number;
  isOverall: boolean;
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n?.language ?? "en";
  const streak = (isOverall ? row.currentStreak : row.bestStreak) ?? 0;
  const points = formatDailyPoints(row.points, language);
  const first = place === 1;

  return (
    <Link
      href={`/profile/${row.userId}`}
      className={cn(cardClass(place), "text-inherit no-underline")}
      data-place={place}
    >
      <Medal place={place} />
      <DailyRankingAvatar
        userId={row.userId}
        username={row.username}
        avatar={row.avatar}
        size={first ? 72 : 60}
        className={cn(
          first
            ? "!h-12 !w-12 !min-w-12 @[720px]:!h-[72px] @[720px]:!w-[72px] @[720px]:!min-w-[72px] @[720px]:text-[27px]"
            : "!h-10 !w-10 !min-w-10 @[720px]:!h-[60px] @[720px]:!w-[60px] @[720px]:!min-w-[60px] @[720px]:text-[23px]",
        )}
      />
      <span className={"flex min-w-0 max-w-full items-center gap-1.5"}>
        <Text
          component={"span"}
          fw={600}
          c="var(--gn-text)"
          truncate
          className={"text-[12px] @[720px]:text-[15px] @[720px]:font-bold"}
        >
          {row.username}
        </Text>
        <DailyRankingBadge
          show={row.supporterBadge}
          className={"hidden @[720px]:flex"}
        />
      </span>
      <Text
        component={"span"}
        fw={700}
        className={"text-[14px] text-brand-5 @[720px]:text-[20px]"}
      >
        <span className={"@[720px]:hidden"}>{points}</span>
        <span className={"hidden @[720px]:inline"}>
          {t("daily.ranking.points", { points })}
        </span>
      </Text>
      <span
        className={
          "hidden items-center gap-1 text-[12px] font-medium text-subtle @[720px]:flex"
        }
      >
        <IconFlame size={13} className={"text-brand-5"} aria-hidden />
        {t(
          streak === 1
            ? "daily.ranking.streakDaysOne"
            : "daily.ranking.streakDays",
          { count: streak },
        )}
      </span>
    </Link>
  );
};

const OpenSpot = ({ place }: { place: number }) => {
  const { t } = useTranslation();
  return (
    <div className={cardClass(place)} data-place={place}>
      <Medal place={place} />
      <span
        className={
          "flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-line-strong text-faint @[720px]:h-[60px] @[720px]:w-[60px]"
        }
      >
        <IconPlus size={20} aria-hidden />
      </span>
      <Text
        component={"span"}
        fw={700}
        className={"text-[12px] text-subtle @[720px]:text-[15px]"}
      >
        {t("daily.ranking.openSpot")}
      </Text>
      <Text
        component={"span"}
        className={"hidden text-center text-[12px] text-faint @[720px]:block"}
      >
        {t("daily.ranking.openSpotHint")}
      </Text>
    </div>
  );
};

interface Props {
  /** The first rows of the ranking; only the top three are used. */
  rows: DailyRankingRowDto[];
  isOverall: boolean;
}

/**
 * Top three in visual order 2-1-3; an empty place shows an open spot.
 */
const DailyRankingPodium = ({ rows, isOverall }: Props) => (
  <div className={"flex items-end justify-center gap-2 @[720px]:gap-4"}>
    {[2, 1, 3].map((place) => {
      const row = rows[place - 1];
      return row ? (
        <PodiumPlayer
          key={place}
          row={row}
          place={place}
          isOverall={isOverall}
        />
      ) : (
        <OpenSpot key={place} place={place} />
      );
    })}
  </div>
);

export { DailyRankingPodium };
