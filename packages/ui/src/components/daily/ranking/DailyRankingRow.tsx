import type { ReactNode } from "react";
import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconFlame } from "@tabler/icons-react";
import type { DailyRankingRowDto } from "@repo/wrapper/server";
import {
  DailyRankingAvatar,
  DailyRankingChange,
  DailyRankingName,
} from "#@/components/daily/ranking/DailyRankingParts";
import {
  formatDailyCount,
  formatDailyPoints,
} from "#@/components/daily/ranking/rankingFormat";
import {
  DAILY_MODE_ICONS,
  DAILY_MODES,
  type DailyMode,
} from "#@/components/daily/util/dailyModes";
import { cn } from "#@/util/cn";
import { Link } from "#@/util/link";

/**
 * Shared column template of the header and rows, by ranking mode (null = overall).
 * Rows switch to it once the table container is wide enough (`@[720px]`).
 */
export const DAILY_RANKING_COLUMNS = {
  overall: "@[720px]:grid-cols-[64px_minmax(0,1fr)_96px_250px_90px_70px]",
  mode: "@[720px]:grid-cols-[64px_minmax(0,1fr)_80px_90px_100px_100px_70px]",
} as const;

const MUTED = "text-[#7A7A7A]";

const Dash = () => <span className={MUTED}>–</span>;

const Streak = ({ value }: { value: number | undefined }) => (
  <span className={"inline-flex items-center justify-end gap-1"}>
    <IconFlame size={13} className={"text-brand-5"} aria-hidden />
    <Text component={"span"} fz={13} fw={600} c={"white"}>
      {value ?? "–"}
    </Text>
  </span>
);

interface Props {
  row: DailyRankingRowDto;
  /** The response's mode: null is the overall ranking. */
  mode: DailyMode | null;
  isViewer?: boolean;
}

/**
 * One ranking line: a table row when the table is wide, a card otherwise
 * (frame 5051:13889). The name links to the profile.
 */
const DailyRankingRow = ({ row, mode, isViewer }: Props) => {
  const { t, i18n } = useTranslation();
  const language = i18n?.language ?? "en";
  const points = (value: number | null | undefined) =>
    value == undefined ? <Dash /> : formatDailyPoints(value, language);
  const winRate = `${formatDailyPoints(row.winRate, language)}%`;
  const streak = mode ? row.bestStreak : row.currentStreak;
  const modePoints = (row.modePoints ?? {}) as Partial<
    Record<DailyMode, number>
  >;
  const top = row.position <= 3;

  const position = (
    <span className={"flex items-center gap-1.5"}>
      <Text
        component={"span"}
        fw={700}
        className={cn(
          "text-[14px] @[720px]:text-[15px]",
          top && !isViewer ? "text-brand-5" : "text-white",
        )}
      >
        #{row.position}
      </Text>
      <DailyRankingChange value={row.positionChange} />
    </span>
  );

  const name = (
    <Link
      href={`/profile/${row.userId}`}
      className={"flex min-w-0 items-center gap-2.5 text-inherit no-underline"}
    >
      <DailyRankingAvatar
        userId={row.userId}
        username={row.username}
        avatar={row.avatar}
        size={32}
        className={
          "!h-[30px] !w-[30px] !min-w-[30px] @[720px]:!h-8 @[720px]:!w-8 @[720px]:!min-w-8"
        }
      />
      <span className={"flex min-w-0 flex-col"}>
        <DailyRankingName
          username={row.username}
          supporterBadge={row.supporterBadge}
          isViewer={isViewer}
        />
        {/* Card layout only: the streak and win rate under the name. */}
        <span
          className={cn(
            "flex items-center gap-1 text-[12px] @[720px]:hidden",
            MUTED,
          )}
        >
          <IconFlame size={12} className={"text-brand-5"} aria-hidden />
          {t(streak === 1 ? "daily.ranking.daysOne" : "daily.ranking.days", {
            count: streak ?? 0,
          })}
          {" · "}
          {winRate}
        </span>
      </span>
    </Link>
  );

  const cells: ReactNode[] = mode
    ? [
        <Text key={"wins"} component={"span"} fz={13} fw={500} c={"#ADADAD"}>
          {row.wins == undefined ? (
            <Dash />
          ) : (
            formatDailyCount(row.wins, language)
          )}
        </Text>,
        <Text key={"avg"} component={"span"} fz={13} fw={500} c={"#ADADAD"}>
          {points(row.averageAttempts)}
        </Text>,
        <Streak key={"streak"} value={streak} />,
      ]
    : [
        <span
          key={"modes"}
          className={"flex items-center justify-center gap-2.5"}
          aria-label={t("daily.ranking.columns.byMode")}
        >
          {DAILY_MODES.map((dailyMode) => {
            const Icon = DAILY_MODE_ICONS[dailyMode];
            const value = modePoints[dailyMode];
            return (
              <span
                key={dailyMode}
                className={"inline-flex items-center gap-1"}
                title={t(`daily.modes.${dailyMode}.name`)}
              >
                <Icon size={13} className={"text-[#ADADAD]"} aria-hidden />
                <Text
                  component={"span"}
                  fz={12}
                  fw={600}
                  className={value == undefined ? MUTED : "text-white"}
                >
                  {value == undefined
                    ? "–"
                    : formatDailyPoints(value, language)}
                </Text>
              </span>
            );
          })}
        </span>,
        <Streak key={"streak"} value={streak} />,
      ];

  return (
    <div
      data-viewer={isViewer || undefined}
      className={cn(
        // Card layout
        "flex items-center gap-2.5 rounded-[10px] bg-paper-8 px-3 py-2.5",
        // Table layout
        "@[720px]:grid @[720px]:gap-3 @[720px]:bg-transparent @[720px]:px-4",
        mode ? DAILY_RANKING_COLUMNS.mode : DAILY_RANKING_COLUMNS.overall,
        isViewer &&
          "border border-solid border-brand-5 !bg-nav-accent-subtle @[720px]:py-[13px]",
        !isViewer && "border border-solid border-transparent @[720px]:py-2.5",
      )}
    >
      <span className={"w-[66px] shrink-0 @[720px]:w-auto"}>{position}</span>
      <span className={"min-w-0 flex-1"}>{name}</span>
      <Text
        component={"span"}
        fz={15}
        fw={700}
        c={"white"}
        className={"shrink-0 text-right"}
      >
        {formatDailyPoints(row.points, language)}
      </Text>
      {cells.map((cell, index) => (
        <span
          key={index}
          className={cn(
            "hidden @[720px]:block",
            !mode && index === 0 ? "text-center" : "text-right",
          )}
        >
          {cell}
        </span>
      ))}
      <Text
        component={"span"}
        fz={13}
        fw={500}
        c={"#ADADAD"}
        className={"hidden text-right @[720px]:block"}
      >
        {winRate}
      </Text>
    </div>
  );
};

type Column =
  | "position"
  | "player"
  | "points"
  | "byMode"
  | "streak"
  | "wins"
  | "averageAttempts"
  | "bestStreak"
  | "winRate";

/** Column titles for the table layout; hidden while rows are cards. */
const DailyRankingHeader = ({ mode }: { mode: DailyMode | null }) => {
  const { t } = useTranslation();
  const labels: Column[] = mode
    ? [
        "position",
        "player",
        "points",
        "wins",
        "averageAttempts",
        "bestStreak",
        "winRate",
      ]
    : ["position", "player", "points", "byMode", "streak", "winRate"];

  return (
    <div
      className={cn(
        "hidden gap-3 px-4 py-1.5 @[720px]:grid",
        mode ? DAILY_RANKING_COLUMNS.mode : DAILY_RANKING_COLUMNS.overall,
      )}
    >
      {labels.map((label, index) => (
        <Text
          key={label}
          component={"span"}
          fz={11}
          fw={600}
          tt={"uppercase"}
          lts={"0.06em"}
          className={cn(
            MUTED,
            index > 1 && "text-right",
            label === "byMode" && "text-center",
          )}
        >
          {t(`daily.ranking.columns.${label}`)}
        </Text>
      ))}
    </div>
  );
};

export { DailyRankingRow, DailyRankingHeader };
