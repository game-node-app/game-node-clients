import React from "react";
import Head from "next/head";
import { GetServerSidePropsContext } from "next";
import { useTranslation } from "@repo/locales";
import {
  DAILY_RANKING_PERIODS,
  DailyRankingPeriod,
  DailyRankingQuery,
  DailyRankingView,
  isDailyMode,
} from "@repo/ui";

interface Props {
  initialFilters: Partial<DailyRankingQuery>;
}

/** Reads `?mode=&period=&scope=` so other screens can deep-link a list. */
export const getServerSideProps = async ({
  query,
}: GetServerSidePropsContext): Promise<{ props: Props }> => {
  const initialFilters: Partial<DailyRankingQuery> = {};
  if (isDailyMode(query.mode)) initialFilters.mode = query.mode;
  if (DAILY_RANKING_PERIODS.includes(query.period as DailyRankingPeriod)) {
    initialFilters.period = query.period as DailyRankingPeriod;
  }
  if (query.scope === "following") initialFilters.scope = "following";
  return { props: { initialFilters } };
};

const DailyRankingPage = ({ initialFilters }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{`${t("daily.ranking.title")} - GameNode`}</title>
      </Head>
      <DailyRankingView initialFilters={initialFilters} />
    </>
  );
};

export default DailyRankingPage;
