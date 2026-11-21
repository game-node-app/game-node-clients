import { useState } from "react";
import { ActionIcon, Button, Skeleton, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  IconBookmark,
  IconChevronDown,
  IconChevronLeft,
  IconClock,
  IconHelpCircle,
} from "@tabler/icons-react";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { DailyRankingEarlyBanner } from "#@/components/daily/ranking/DailyRankingEarlyBanner";
import { DailyRankingFilters } from "#@/components/daily/ranking/DailyRankingFilters";
import { DailyRankingPodium } from "#@/components/daily/ranking/DailyRankingPodium";
import {
  DailyRankingHeader,
  DailyRankingRow,
} from "#@/components/daily/ranking/DailyRankingRow";
import {
  DailyRankingScoring,
  DailyRankingScoringModal,
} from "#@/components/daily/ranking/DailyRankingScoring";
import { DailyRankingSignInCard } from "#@/components/daily/ranking/DailyRankingSignInCard";
import { DailyRankingViewerSummary } from "#@/components/daily/ranking/DailyRankingViewerSummary";
import { formatDailyCount } from "#@/components/daily/ranking/rankingFormat";
import { useDailyRemaining } from "#@/components/daily/ranking/useDailyRemaining";
import {
  type DailyRankingQuery as Filters,
  type DailyRankingPeriod,
  useInfiniteDailyRanking,
} from "#@/components/daily/ranking/useInfiniteDailyRanking";
import { DailyErrorState } from "#@/components/daily/view/DailyErrorState";
import type { DailyMode } from "#@/components/daily/util/dailyModes";
import { cn } from "#@/util/cn";
import { Link } from "#@/util/link";

const RANKING_HREF = "/daily/ranking";

interface Props {
  /** Initial filters, e.g. from the page URL. */
  initialFilters?: Partial<Filters>;
  /**
   * False where the app draws its own title bar (mobile); the view then
   * leaves out the back link, title and countdown.
   */
  withHeader?: boolean;
}

const EndsIn = ({
  endsAt,
  period,
}: {
  endsAt: string | null | undefined;
  period: DailyRankingPeriod;
}) => {
  const { t } = useTranslation();
  const time = useDailyRemaining(endsAt);
  if (!time || period === "all") return null;

  return (
    <span
      className={
        "inline-flex items-center gap-1.5 self-start rounded-full bg-nav-raised px-2.5 py-1.5 text-[13px] font-semibold text-white @[900px]/page:self-end"
      }
    >
      <IconClock size={14} aria-hidden />
      {t(`daily.ranking.endsIn.${period}`, { time })}
    </span>
  );
};

/**
 * The full Daily ranking: filters, podium, table with paging, the viewer's
 * pinned row and the scoring/summary side column.
 */
const DailyRankingView = ({ initialFilters, withHeader = true }: Props) => {
  const { t, i18n } = useTranslation();
  const language = i18n?.language ?? "en";
  const userId = useUserId();
  const [scoringOpened, scoring] = useDisclosure(false);
  const [state, setFilters] = useState<Filters>({
    period: initialFilters?.period ?? "week",
    mode: initialFilters?.mode ?? null,
    scope: initialFilters?.scope ?? "all",
  });
  // Signing out drops back to everyone: "people I follow" needs a session.
  const filters: Filters = userId ? state : { ...state, scope: "all" };
  const query = useInfiniteDailyRanking(filters);

  const pages = query.data?.pages ?? [];
  const first = pages[0];
  const rows = pages.flatMap((page) => page.data);
  const loadedCount = rows.length;
  const viewer = first?.viewer ?? null;
  const isOverall = filters.mode === null;
  const totalPlayers = first?.totalPlayers ?? 0;
  const pinViewer = viewer != null && viewer.position > loadedCount;
  const tableRows = rows.slice(3);

  const modeName = (mode: DailyMode) => t(`daily.modes.${mode}.name`);
  const subtitle = filters.mode
    ? t("daily.ranking.subtitleMode", {
        mode: modeName(filters.mode),
        period: t(`daily.ranking.periodPhrase.${filters.period}`),
      })
    : t("daily.ranking.subtitleOverall");

  const helpButton = (
    <ActionIcon
      variant={"subtle"}
      color={"gray"}
      size={"lg"}
      onClick={scoring.open}
      aria-label={t("daily.ranking.scoring.title")}
      className={"@[1100px]/page:hidden"}
    >
      <IconHelpCircle size={20} />
    </ActionIcon>
  );

  const header = withHeader && (
    <header
      className={
        "flex flex-col gap-3 @[900px]/page:flex-row @[900px]/page:items-end @[900px]/page:justify-between"
      }
    >
      <div className={"flex min-w-0 flex-col gap-1"}>
        <Link
          href={"/daily"}
          className={
            "inline-flex items-center gap-1 self-start text-[13px] font-semibold text-brand-5 no-underline"
          }
        >
          <IconChevronLeft size={14} aria-hidden />
          Daily
        </Link>
        <div className={"flex items-center gap-2"}>
          <Title
            order={1}
            className={"text-[24px] leading-tight @[900px]/page:text-[34px]"}
          >
            {t("daily.ranking.title")}
          </Title>
          {helpButton}
        </div>
        <Text fz={14} c={"var(--gn-dimmed-2)"}>
          {subtitle}
        </Text>
      </div>
      <EndsIn endsAt={first?.endsAt} period={filters.period} />
    </header>
  );

  const signedOutCard = !userId && (
    <div className={"sticky bottom-0 z-10 pb-2"}>
      <DailyRankingSignInCard redirectTo={RANKING_HREF} />
    </div>
  );

  const pinnedRow = pinViewer && viewer && (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 border-0 border-t border-solid border-line bg-nav-canvas px-3 py-2.5",
        "@[720px]:mx-0 @[720px]:rounded-[14px] @[720px]:border @[720px]:border-brand-5 @[720px]:px-2 @[720px]:py-3 @[720px]:shadow-[0_-8px_12px_rgba(0,0,0,0.6)]",
      )}
    >
      <span
        className={
          "hidden items-center gap-1.5 px-2 pb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-brand-5 @[720px]:flex"
        }
      >
        <IconBookmark size={14} aria-hidden />
        {t("daily.ranking.yourPosition")}
      </span>
      <DailyRankingRow row={viewer} mode={filters.mode} isViewer />
    </div>
  );

  let main;
  if (query.isError) {
    main = (
      <DailyErrorState
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
        backHref={"/daily"}
        backLabel={t("daily.result.backToHub")}
      />
    );
  } else if (!first) {
    main = (
      <div className={"flex flex-col gap-4"}>
        <Skeleton h={250} radius={14} />
        <Skeleton h={360} radius={14} />
      </div>
    );
  } else {
    main = (
      <>
        {filters.period === "today" && totalPlayers <= 3 && (
          <DailyRankingEarlyBanner totalPlayers={totalPlayers} />
        )}
        <DailyRankingPodium rows={rows} isOverall={isOverall} />
        <div
          className={
            "flex flex-col gap-1.5 @[720px]:gap-1 @[720px]:rounded-[14px] @[720px]:border @[720px]:border-solid @[720px]:border-line @[720px]:bg-paper-7 @[720px]:p-2"
          }
        >
          <DailyRankingHeader mode={filters.mode} />
          {tableRows.length === 0 ? (
            <Text
              fz={13}
              c={"var(--gn-dimmed)"}
              ta={"center"}
              className={"py-2"}
            >
              {t("daily.ranking.emptyTable")}
            </Text>
          ) : (
            tableRows.map((row) => (
              <DailyRankingRow
                key={row.userId}
                row={row}
                mode={filters.mode}
                isViewer={!pinViewer && row.userId === viewer?.userId}
              />
            ))
          )}
        </div>
        {loadedCount > 3 && (
          <div className={"flex flex-col items-center gap-2"}>
            {query.hasNextPage && (
              <Button
                variant={"default"}
                radius={8}
                h={44}
                px={16}
                fz={14}
                loading={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
                leftSection={<IconChevronDown size={16} />}
                className={"w-full !border-0 !bg-nav-raised @[720px]:w-auto"}
              >
                {t("daily.ranking.loadMore")}
              </Button>
            )}
            <Text fz={12} className={"hidden text-dimmed @[720px]:block"}>
              {t("daily.ranking.showing", {
                from: 4,
                to: formatDailyCount(loadedCount, language),
                total: formatDailyCount(totalPlayers, language),
              })}
            </Text>
          </div>
        )}
        {pinnedRow}
        {signedOutCard}
      </>
    );
  }

  return (
    <div
      className={
        "@container/page mx-auto mb-8 flex w-full max-w-[1304px] flex-col gap-6 pt-2 sm:pt-6"
      }
    >
      {header}
      <DailyRankingFilters
        filters={filters}
        onChange={setFilters}
        signedIn={!!userId}
      />
      <div
        className={
          "grid grid-cols-1 gap-6 @[1100px]/page:grid-cols-[minmax(0,940px)_340px]"
        }
      >
        <div className={"@container flex min-w-0 flex-col gap-4"}>{main}</div>
        <aside className={"flex flex-col gap-4"}>
          <div className={"hidden @[1100px]/page:block"}>
            <DailyRankingScoring
              key={`${filters.mode}-${filters.period}`}
              defaultOpened={isOverall && filters.period !== "today"}
            />
          </div>
          {userId && first && (
            <DailyRankingViewerSummary
              viewer={viewer}
              pointsToTop100={first.pointsToTop100}
              period={filters.period}
              isOverall={isOverall}
            />
          )}
        </aside>
      </div>
      <DailyRankingScoringModal
        opened={scoringOpened}
        onClose={scoring.close}
      />
    </div>
  );
};

export { DailyRankingView };
